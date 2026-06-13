import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { faceMatch } from "@/lib/kyc";
import { claimAadhaarPhoto } from "@/lib/kyc-photo-cache";
import { logEvent } from "@/lib/events";

const schema = z.object({
  selfieBase64: z.string().min(100, "Invalid image data"),
});

export async function POST(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "TECHNICIAN");
  if (errorResponse) return errorResponse;

  let body: z.infer<typeof schema>;
  try { body = schema.parse(await request.json()); }
  catch (e: unknown) {
    const msg = e instanceof z.ZodError ? e.errors[0].message : "Invalid request";
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: auth.user!.userId },
    select: { id: true, kycStatus: true, kycData: true },
  });
  if (!profile) return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });

  const data = (profile.kycData ?? {}) as Record<string, unknown>;
  if (!data.panVerifiedAt) {
    return NextResponse.json({ success: false, message: "Complete PAN verification first" }, { status: 400 });
  }

  const retries = (data.selfieRetries as number) ?? 0;
  if (retries >= 3) {
    await prisma.technicianProfile.update({ where: { id: profile.id }, data: { kycStatus: "MANUAL_REVIEW" } });
    return NextResponse.json({ success: false, message: "Maximum selfie attempts reached. Our team will contact you." }, { status: 429 });
  }

  // Claim from in-memory cache (single-use, 15-min TTL — never stored in DB)
  const aadhaarPhoto = claimAadhaarPhoto(profile.id);
  const hasAadhaarPhoto = !!(data.hasAadhaarPhoto as boolean | undefined);

  // Fail closed: if Aadhaar didn't return a photo, we cannot do face match —
  // route to MANUAL_REVIEW rather than auto-passing.
  if (hasAadhaarPhoto && !aadhaarPhoto) {
    // Cache expired (>15 min since OTP verify) or server restarted — manual review required
    await prisma.technicianProfile.update({
      where: { id: profile.id },
      data: { kycStatus: "MANUAL_REVIEW" },
    });
    await logEvent({
      type: "kyc.face_match_cache_expired",
      actorType: "TECHNICIAN",
      actorId: auth.user!.userId,
      subjectType: "technician_profile",
      subjectId: profile.id,
    });
    return NextResponse.json({
      success: false,
      message: "The verification session expired. Our team will complete your KYC manually within 24 hours.",
    }, { status: 422 });
  }

  try {
    // If Aadhaar never returned a photo (provider didn't include one), route to manual review
    let result: { confidence: number; isMatch: boolean };
    if (!aadhaarPhoto) {
      await prisma.technicianProfile.update({
        where: { id: profile.id },
        data: { kycStatus: "MANUAL_REVIEW" },
      });
      await logEvent({
        type: "kyc.face_match_unavailable",
        actorType: "TECHNICIAN",
        actorId: auth.user!.userId,
        subjectType: "technician_profile",
        subjectId: profile.id,
        payload: { reason: "no_aadhaar_photo" },
      });
      return NextResponse.json({
        success: false,
        message: "Face verification unavailable for your Aadhaar — routed to manual review. Our team will contact you within 24 hours.",
      }, { status: 422 });
    }
    result = await faceMatch(aadhaarPhoto, body.selfieBase64);

    const updatedData: Record<string, unknown> = {
      ...data,
      faceMatchScore: Math.round(result.confidence * 100),
      faceMatchAt: new Date().toISOString(),
      selfieRetries: retries + 1,
      hasAadhaarPhoto: false, // clear the flag — photo was claimed from cache and is gone
    };

    await logEvent({
      type: result.isMatch ? "kyc.face_match_passed" : "kyc.face_match_failed",
      actorType: "TECHNICIAN",
      actorId: auth.user!.userId,
      subjectType: "technician_profile",
      subjectId: profile.id,
      payload: { confidence: Math.round(result.confidence * 100) },
    });

    if (!result.isMatch) {
      await prisma.technicianProfile.update({ where: { id: profile.id }, data: { kycData: updatedData as Prisma.InputJsonValue } });
      if (retries + 1 >= 3) {
        await prisma.technicianProfile.update({ where: { id: profile.id }, data: { kycStatus: "MANUAL_REVIEW" } });
        return NextResponse.json({ success: false, message: "Face match unsuccessful after 3 attempts. Our team will contact you within 24 hours." }, { status: 422 });
      }
      return NextResponse.json({ success: false, message: `Face match confidence too low (${Math.round(result.confidence * 100)}%). Please retake in good lighting.` }, { status: 422 });
    }

    // All checks passed — mark KYC complete
    await prisma.technicianProfile.update({
      where: { id: profile.id },
      data: {
        kycStatus: "PASSED",
        verificationLevel: "ID_VERIFIED",
        kycData: updatedData as Prisma.InputJsonValue,
      },
    });

    await logEvent({
      type: "kyc.passed",
      actorType: "TECHNICIAN",
      actorId: auth.user!.userId,
      subjectType: "technician_profile",
      subjectId: profile.id,
      payload: {
        maskedAadhaar: data.maskedAadhaar,
        nameMatchScore: data.nameMatchScore,
        faceMatchScore: Math.round(result.confidence * 100),
      },
    });

    return NextResponse.json({ success: true, message: "Identity verified successfully. You are now ID Verified!" });
  } catch (err) {
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : "Face match failed" }, { status: 502 });
  }
}
