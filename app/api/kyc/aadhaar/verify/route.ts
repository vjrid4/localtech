import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { verifyAadhaarOTP } from "@/lib/kyc";
import { storeAadhaarPhoto } from "@/lib/kyc-photo-cache";
import { logEvent } from "@/lib/events";

const schema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
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
  const clientId = data.aadhaarClientId as string | undefined;
  if (!clientId) {
    return NextResponse.json({ success: false, message: "Start Aadhaar verification first" }, { status: 400 });
  }

  try {
    const aadhaar = await verifyAadhaarOTP(clientId, body.otp);

    // Photo held in memory only — never written to DB
    if (aadhaar.photo) {
      storeAadhaarPhoto(profile.id, aadhaar.photo);
    }

    // Store masked data only — never the full Aadhaar number or photo
    await prisma.technicianProfile.update({
      where: { id: profile.id },
      data: {
        kycData: {
          ...data,
          maskedAadhaar: aadhaar.maskedAadhaar,
          aadhaarName: aadhaar.name,
          aadhaarDob: aadhaar.dob,
          hasAadhaarPhoto: !!aadhaar.photo, // boolean only — for selfie route to know whether face match is possible
          aadhaarVerifiedAt: new Date().toISOString(),
        },
      },
    });

    await logEvent({
      type: "kyc.aadhaar_verified",
      actorType: "TECHNICIAN",
      actorId: auth.user!.userId,
      subjectType: "technician_profile",
      subjectId: profile.id,
      payload: { maskedAadhaar: aadhaar.maskedAadhaar },
    });

    return NextResponse.json({
      success: true,
      data: { name: aadhaar.name, dob: aadhaar.dob, maskedAadhaar: aadhaar.maskedAadhaar },
    });
  } catch (err) {
    await logEvent({
      type: "kyc.aadhaar_otp_failed",
      actorType: "TECHNICIAN",
      actorId: auth.user!.userId,
      subjectType: "technician_profile",
      subjectId: profile.id,
    });
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : "OTP verification failed" }, { status: 400 });
  }
}
