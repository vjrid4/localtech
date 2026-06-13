import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { initiateAadhaarOTP } from "@/lib/kyc";
import { logEvent } from "@/lib/events";

const schema = z.object({
  aadhaarNumber: z.string().regex(/^[2-9][0-9]{11}$/, "Aadhaar must be 12 digits and cannot start with 0 or 1"),
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
  if (!profile) return NextResponse.json({ success: false, message: "Technician profile not found" }, { status: 404 });

  // Block if already passed or in final manual review after 3 retries
  if (profile.kycStatus === "PASSED") {
    return NextResponse.json({ success: false, message: "KYC already completed" }, { status: 409 });
  }
  const data = (profile.kycData ?? {}) as Record<string, unknown>;
  const retries = (data.aadhaarRetries as number) ?? 0;
  if (retries >= 3) {
    return NextResponse.json({ success: false, message: "Maximum OTP attempts reached. Our team will contact you." }, { status: 429 });
  }

  try {
    const { clientId } = await initiateAadhaarOTP(body.aadhaarNumber);

    await prisma.technicianProfile.update({
      where: { id: profile.id },
      data: {
        kycStatus: "PENDING",
        kycData: { ...data, aadhaarClientId: clientId, aadhaarRetries: retries + 1 },
      },
    });

    await logEvent({
      type: "kyc.aadhaar_otp_sent",
      actorType: "TECHNICIAN",
      actorId: auth.user!.userId,
      subjectType: "technician_profile",
      subjectId: profile.id,
      payload: { attempt: retries + 1 },
    });

    return NextResponse.json({ success: true, message: "OTP sent to your Aadhaar-linked mobile number" });
  } catch (err) {
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : "Failed to send OTP" }, { status: 502 });
  }
}
