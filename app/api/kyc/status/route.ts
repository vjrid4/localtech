import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { QUIZ_RETRY_DAYS } from "@/lib/quiz/questions";

export async function GET(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "TECHNICIAN");
  if (errorResponse) return errorResponse;

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: auth.user!.userId },
    select: {
      kycStatus: true,
      verificationLevel: true,
      isActive: true,
      kycData: true,
      categories: true,
      user: { select: { name: true } },
    },
  });

  if (!profile) return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });

  const data = (profile.kycData ?? {}) as Record<string, unknown>;

  // Derive which KYC sub-steps are complete
  const subSteps = {
    aadhaarVerified: !!data.aadhaarVerifiedAt,
    panVerified: !!data.panVerifiedAt,
    selfieVerified: profile.kycStatus === "PASSED",
  };

  // Quiz state
  const quizStatus = (data.quizStatus as string) ?? "NOT_STARTED";
  const quizLastAttemptAt = (data.quizLastAttemptAt as string) ?? null;
  const quizRetryEligibleAt = quizLastAttemptAt && quizStatus === "FAILED"
    ? new Date(new Date(quizLastAttemptAt).getTime() + QUIZ_RETRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    : null;

  return NextResponse.json({
    success: true,
    data: {
      name: profile.user.name,
      kycStatus: profile.kycStatus,
      verificationLevel: profile.verificationLevel,
      isActive: profile.isActive,
      categories: profile.categories,
      subSteps,
      // Safe fields only — never return raw kycData to client
      maskedAadhaar: (data.maskedAadhaar as string) ?? null,
      aadhaarName: (data.aadhaarName as string) ?? null,
      panNumber: (data.panNumber as string) ?? null,
      faceMatchScore: (data.faceMatchScore as number) ?? null,
      // Quiz
      quizStatus,
      quizScore: (data.quizScore as number) ?? null,
      quizTotal: (data.quizTotal as number) ?? null,
      quizAttempts: (data.quizAttempts as number) ?? 0,
      quizLastAttemptAt,
      quizRetryEligibleAt,
    },
  });
}
