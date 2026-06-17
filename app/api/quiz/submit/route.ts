import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { QUESTIONS, QUIZ_PASS_SCORE, QUIZ_QUESTION_COUNT, QUIZ_SESSION_TTL_MS } from "@/lib/quiz/questions";
import { logEvent } from "@/lib/events";
import { sendWhatsApp } from "@/lib/whatsapp";

const schema = z.object({
  answers: z
    .array(z.number().int().min(0).max(3))
    .length(QUIZ_QUESTION_COUNT, `Submit exactly ${QUIZ_QUESTION_COUNT} answers`),
});

/**
 * Grade the quiz.
 * - Validates an active, unexpired session exists.
 * - Answers are compared against server-stored correctIndex — client never sees answers.
 * - Clears the session from kycData after grading (single-use).
 * - PASSED: updates quizStatus; triggers activation_congrats pathway.
 * - FAILED: records timestamp to enforce retry gate.
 */
export async function POST(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "TECHNICIAN");
  if (errorResponse) return errorResponse;

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch (e: unknown) {
    const msg = e instanceof z.ZodError ? e.errors[0].message : "Invalid request";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: auth.user!.userId },
    select: { id: true, kycStatus: true, kycData: true, whatsappNumber: true, user: { select: { name: true } } },
  });
  if (!profile) return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });

  const data = (profile.kycData ?? {}) as Record<string, unknown>;
  const session = data.quizSession as { questionIds: number[]; startedAt: string; expiresAt: string } | undefined;

  if (!session?.questionIds?.length) {
    return NextResponse.json(
      { success: false, message: "No active quiz session — start the quiz first" },
      { status: 409 },
    );
  }

  // Expire check (60-minute window)
  if (Date.now() > new Date(session.expiresAt).getTime()) {
    return NextResponse.json(
      { success: false, message: "Quiz session expired (60 min limit). Start a new attempt." },
      { status: 410 },
    );
  }

  // Grade server-side — client never touches correctIndex
  let correct = 0;
  const breakdown: { pos: number; yourAnswer: number; correct: number; passed: boolean }[] = [];
  for (let pos = 0; pos < QUIZ_QUESTION_COUNT; pos++) {
    const qId = session.questionIds[pos];
    const correctIdx = QUESTIONS[qId].correctIndex;
    const submitted = body.answers[pos];
    const passed = submitted === correctIdx;
    if (passed) correct++;
    breakdown.push({ pos, yourAnswer: submitted, correct: correctIdx, passed });
  }

  const score = correct;
  const passed = score >= QUIZ_PASS_SCORE;
  const now = new Date().toISOString();
  const attempts = ((data.quizAttempts as number) ?? 0) + 1;

  // Build updated kycData — clear session so it can't be reused
  const updatedData: Record<string, unknown> = {
    ...data,
    quizStatus: passed ? "PASSED" : "FAILED",
    quizScore: score,
    quizTotal: QUIZ_QUESTION_COUNT,
    quizAttempts: attempts,
    quizLastAttemptAt: now,
    quizSession: null, // consumed — single use
    ...(passed ? { quizPassedAt: now } : {}),
  };

  await prisma.technicianProfile.update({
    where: { id: profile.id },
    data: { kycData: updatedData as Prisma.InputJsonValue },
  });

  await logEvent({
    type: passed ? "quiz.passed" : "quiz.failed",
    actorType: "TECHNICIAN",
    actorId: auth.user!.userId,
    subjectType: "technician_profile",
    subjectId: profile.id,
    payload: { score, total: QUIZ_QUESTION_COUNT, attempts },
  });

  // Nudge for failed attempts
  if (!passed && profile.whatsappNumber) {
    const retryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const retryStr = retryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    void sendWhatsApp({
      to: profile.whatsappNumber,
      template: "kyc_nudge",
      params: {
        name: profile.user.name,
        kycUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in"}/dashboard/technician/onboarding`,
      },
      subjectType: "technician_profile",
      subjectId: profile.id,
    }).catch(() => {});
    void logEvent({
      type: "quiz.retry_available_at",
      actorType: "SYSTEM",
      subjectType: "technician_profile",
      subjectId: profile.id,
      payload: { retryAt: retryDate.toISOString(), retryStr },
    });
  }

  const retryEligibleAt = !passed
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  return NextResponse.json({
    success: true,
    data: {
      score,
      total: QUIZ_QUESTION_COUNT,
      passed,
      passScore: QUIZ_PASS_SCORE,
      attempts,
      retryEligibleAt,
      breakdown, // show which answers were right/wrong for learning
    },
  });
}
