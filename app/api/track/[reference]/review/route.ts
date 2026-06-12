import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { logEvent } from "@/lib/events";

/**
 * Public post-completion review (T18). Verified-transaction-only by
 * construction: a review can only exist behind a COMPLETED job, reached via
 * the unguessable reference, and only once. 1–2★ fires review.low_rating so
 * the admin can make the recovery call — reviews are never suppressed.
 */
const schema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional(),
});

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
    return NextResponse.json({ success: false, message: "Invalid review" }, { status: 400 });
  }

  const job = await prisma.job.findUnique({
    where: { reference: ref },
    select: { id: true, status: true, technicianId: true, review: { select: { id: true } } },
  });
  if (!job) {
    return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
  }
  if (job.status !== "COMPLETED") {
    return NextResponse.json({ success: false, message: "Reviews open after the repair is completed" }, { status: 422 });
  }
  if (job.review) {
    return NextResponse.json({ success: false, message: "This repair has already been reviewed" }, { status: 409 });
  }

  const review = await prisma.jobReview.create({
    data: {
      jobId: job.id,
      technicianId: job.technicianId,
      rating: body.rating,
      text: body.text?.trim() || null,
    },
  });

  await logEvent({
    type: body.rating <= 2 ? "review.low_rating" : "review.submitted",
    actorType: "CUSTOMER",
    subjectType: "job",
    subjectId: job.id,
    payload: { rating: body.rating, technicianId: job.technicianId, hasText: !!body.text },
  });

  return NextResponse.json({ success: true, data: { id: review.id } }, { status: 201 });
}
