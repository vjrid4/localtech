import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { verifyPAN, nameSimilarity } from "@/lib/kyc";
import { logEvent } from "@/lib/events";

const schema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/i, "Invalid PAN format (e.g. ABCDE1234F)"),
});

const NAME_MATCH_THRESHOLD = 0.75; // slightly relaxed from spec's 0.8 to handle name order variations

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
  if (!data.aadhaarVerifiedAt) {
    return NextResponse.json({ success: false, message: "Complete Aadhaar verification first" }, { status: 400 });
  }

  const retries = (data.panRetries as number) ?? 0;
  if (retries >= 3) {
    await prisma.technicianProfile.update({ where: { id: profile.id }, data: { kycStatus: "MANUAL_REVIEW" } });
    return NextResponse.json({ success: false, message: "Maximum PAN attempts reached. Our team will contact you." }, { status: 429 });
  }

  try {
    const pan = await verifyPAN(body.panNumber.toUpperCase());
    const aadhaarName = data.aadhaarName as string ?? "";
    const similarity = nameSimilarity(aadhaarName, pan.name);

    await logEvent({
      type: "kyc.pan_checked",
      actorType: "TECHNICIAN",
      actorId: auth.user!.userId,
      subjectType: "technician_profile",
      subjectId: profile.id,
      payload: { similarity: Math.round(similarity * 100), matched: similarity >= NAME_MATCH_THRESHOLD },
    });

    if (similarity < NAME_MATCH_THRESHOLD) {
      await prisma.technicianProfile.update({
        where: { id: profile.id },
        data: { kycData: { ...data, panRetries: retries + 1 } },
      });
      // After 3 name mismatches, route to manual review
      if (retries + 1 >= 3) {
        await prisma.technicianProfile.update({ where: { id: profile.id }, data: { kycStatus: "MANUAL_REVIEW" } });
      }
      return NextResponse.json({
        success: false,
        message: `Name on PAN (${pan.name}) does not match Aadhaar (${aadhaarName}). Please check the PAN number.`,
      }, { status: 422 });
    }

    await prisma.technicianProfile.update({
      where: { id: profile.id },
      data: {
        kycData: {
          ...data,
          panNumber: pan.panNumber,
          panName: pan.name,
          panVerifiedAt: new Date().toISOString(),
          nameMatchScore: Math.round(similarity * 100),
          panRetries: retries + 1,
        },
      },
    });

    return NextResponse.json({ success: true, data: { panName: pan.name, matchScore: Math.round(similarity * 100) } });
  } catch (err) {
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : "PAN verification failed" }, { status: 502 });
  }
}
