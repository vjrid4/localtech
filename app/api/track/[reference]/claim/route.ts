import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { logEvent } from "@/lib/events";

/**
 * File a warranty claim from the public track page (T20). Only while the
 * job's warranty is ACTIVE and unexpired; one open claim at a time.
 */
const schema = z.object({ description: z.string().min(10).max(1000) });

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ reference: string }> },
) {
  const { reference } = await context.params;
  const ref = reference?.toUpperCase().trim();

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, message: "Please describe the issue (at least 10 characters)" },
      { status: 400 },
    );
  }

  const job = await prisma.job.findUnique({
    where: { reference: ref },
    select: {
      id: true,
      warranty: { select: { id: true, status: true, expiresAt: true, claims: { where: { status: "OPEN" }, select: { id: true } } } },
    },
  });
  if (!job?.warranty) {
    return NextResponse.json({ success: false, message: "No warranty found for this booking" }, { status: 404 });
  }
  if (job.warranty.expiresAt < new Date()) {
    return NextResponse.json({ success: false, message: "This warranty has expired" }, { status: 422 });
  }
  if (job.warranty.claims.length > 0) {
    return NextResponse.json({ success: false, message: "A claim is already being processed — we'll call you" }, { status: 409 });
  }

  const claim = await prisma.$transaction(async (tx) => {
    const c = await tx.jobWarrantyClaim.create({
      data: { warrantyId: job.warranty!.id, description: body.description.trim() },
    });
    await tx.jobWarranty.update({
      where: { id: job.warranty!.id },
      data: { status: "CLAIMED" },
    });
    return c;
  });

  await logEvent({
    type: "warranty.claim_filed",
    actorType: "CUSTOMER",
    subjectType: "job",
    subjectId: job.id,
    payload: { claimId: claim.id, reference: ref },
  });

  return NextResponse.json({ success: true, data: { id: claim.id } }, { status: 201 });
}
