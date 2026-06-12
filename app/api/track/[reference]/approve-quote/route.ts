import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logEvent } from "@/lib/events";

/**
 * Customer one-tap quote approval from the public track page. No login —
 * the LT-XXXXXXX reference is unguessable (32^7 ≈ 34B combinations) and
 * approval is a low-risk, customer-favourable action.
 */
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ reference: string }> },
) {
  const { reference } = await context.params;
  const ref = reference?.toUpperCase().trim();

  const job = await prisma.job.findUnique({ where: { reference: ref } });
  if (!job) {
    return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
  }
  if (job.status !== "QUOTED") {
    return NextResponse.json(
      { success: false, message: "There is no quote awaiting approval" },
      { status: 422 },
    );
  }

  const updated = await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "QUOTE_APPROVED",
      quoteApprovedAt: new Date(),
      statusHistory: { push: { status: "QUOTE_APPROVED", at: new Date().toISOString(), by: "CUSTOMER" } },
    },
  });

  await logEvent({
    type: "job.quote_approved",
    actorType: "CUSTOMER",
    subjectType: "job",
    subjectId: job.id,
    payload: { amountPaise: job.quoteAmount },
  });

  return NextResponse.json({ success: true, data: { status: updated.status } });
}
