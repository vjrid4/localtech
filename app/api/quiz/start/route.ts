import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { QUESTIONS, selectQuestions, QUIZ_QUESTION_COUNT, QUIZ_SESSION_TTL_MS, QUIZ_RETRY_DAYS } from "@/lib/quiz/questions";
import { logEvent } from "@/lib/events";

/**
 * Start a quiz session.
 * - Blocked if quiz already PASSED.
 * - Blocked if FAILED within the last QUIZ_RETRY_DAYS days.
 * - KYC must be PASSED before attempting the quiz.
 * Selects QUIZ_QUESTION_COUNT random questions and stores their IDs
 * server-side in kycData. Returns questions WITHOUT correctIndex.
 */
export async function POST(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "TECHNICIAN");
  if (errorResponse) return errorResponse;

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: auth.user!.userId },
    select: { id: true, kycStatus: true, kycData: true },
  });
  if (!profile) return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });

  if (profile.kycStatus !== "PASSED") {
    return NextResponse.json(
      { success: false, message: "Complete identity verification (KYC) before taking the quiz" },
      { status: 403 },
    );
  }

  const data = (profile.kycData ?? {}) as Record<string, unknown>;
  const quizStatus = (data.quizStatus as string) ?? "NOT_STARTED";

  if (quizStatus === "PASSED") {
    return NextResponse.json({ success: false, message: "You have already passed the quiz" }, { status: 409 });
  }

  // Retry gate — one attempt per QUIZ_RETRY_DAYS
  if (quizStatus === "FAILED") {
    const lastAttempt = data.quizLastAttemptAt ? new Date(data.quizLastAttemptAt as string) : null;
    if (lastAttempt) {
      const eligibleAt = new Date(lastAttempt.getTime() + QUIZ_RETRY_DAYS * 24 * 60 * 60 * 1000);
      if (Date.now() < eligibleAt.getTime()) {
        const daysLeft = Math.ceil((eligibleAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        return NextResponse.json(
          { success: false, message: `You can retry in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`, retryEligibleAt: eligibleAt.toISOString() },
          { status: 429 },
        );
      }
    }
  }

  // Pick random questions
  const questionIds = selectQuestions(QUIZ_QUESTION_COUNT);
  const session = {
    questionIds,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + QUIZ_SESSION_TTL_MS).toISOString(),
  };

  const updatedData: Record<string, unknown> = { ...data, quizSession: session };
  await prisma.technicianProfile.update({
    where: { id: profile.id },
    data: { kycData: updatedData as Prisma.InputJsonValue },
  });

  await logEvent({
    type: "quiz.started",
    actorType: "TECHNICIAN",
    actorId: auth.user!.userId,
    subjectType: "technician_profile",
    subjectId: profile.id,
    payload: { attempt: ((data.quizAttempts as number) ?? 0) + 1 },
  });

  // Return questions WITHOUT correctIndex
  const questions = questionIds.map((qId, pos) => {
    const q = QUESTIONS[qId];
    return { pos, category: q.category, question: q.question, options: q.options };
  });

  return NextResponse.json({
    success: true,
    data: {
      questions,
      total: QUIZ_QUESTION_COUNT,
      expiresAt: session.expiresAt,
    },
  });
}
