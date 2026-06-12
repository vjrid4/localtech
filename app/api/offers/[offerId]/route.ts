import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireTechnicianProfile } from "@/lib/marketplace";
import { assignTechnician } from "@/lib/dispatch";
import { logEvent } from "@/lib/events";

const actionSchema = z.object({ action: z.enum(["accept", "decline"]) });

/** Respond to a dispatch offer. Accept is atomic — first accept wins. */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ offerId: string }> },
) {
  const { profile, errorResponse } = await requireTechnicianProfile(request);
  if (errorResponse) return errorResponse;

  const { offerId } = await context.params;
  let action: "accept" | "decline";
  try {
    ({ action } = actionSchema.parse(await request.json()));
  } catch {
    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  }

  const offer = await prisma.dispatchOffer.findUnique({ where: { id: offerId } });
  if (!offer || offer.technicianId !== profile!.id) {
    return NextResponse.json({ success: false, message: "Offer not found" }, { status: 404 });
  }
  if (offer.status !== "SENT" || offer.expiresAt < new Date()) {
    return NextResponse.json({ success: false, message: "This offer has expired" }, { status: 410 });
  }

  if (action === "decline") {
    await prisma.dispatchOffer.update({
      where: { id: offerId },
      data: { status: "DECLINED", respondedAt: new Date() },
    });
    await logEvent({
      type: "offer.declined",
      actorType: "TECHNICIAN",
      actorId: profile!.userId,
      subjectType: "dispatch",
      subjectId: offer.dispatchId,
      payload: { technicianId: profile!.id },
    });
    return NextResponse.json({ success: true, data: { won: false, declined: true } });
  }

  const job = await assignTechnician({
    dispatchId: offer.dispatchId,
    technicianId: profile!.id,
    actorType: "TECHNICIAN",
    actorId: profile!.userId,
  });

  if (!job) {
    return NextResponse.json(
      { success: false, message: "Job already taken — you'll be prioritised for the next one" },
      { status: 409 },
    );
  }

  return NextResponse.json({ success: true, data: { won: true, jobId: job.id, reference: job.reference } });
}
