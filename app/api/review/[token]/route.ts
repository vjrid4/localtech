import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyReviewToken } from "@/lib/review-token";
import { logEvent } from "@/lib/events";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const payload = verifyReviewToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, message: "This review link has expired or is invalid." }, { status: 400 });
  }

  const job = await prisma.job.findUnique({
    where: { id: payload.jobId },
    select: {
      status: true,
      completedAt: true,
      reference: true,
      review: { select: { rating: true } },
      technician: {
        select: {
          photoUrl: true,
          user: { select: { name: true } },
          trustScore: true,
          totalCompleted: true,
        },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      reference: job.reference,
      status: job.status,
      completedAt: job.completedAt,
      alreadyReviewed: !!job.review,
      existingRating: job.review?.rating ?? null,
      technician: {
        name: job.technician.user.name,
        photoUrl: job.technician.photoUrl,
        trustScore: job.technician.trustScore,
        totalCompleted: job.technician.totalCompleted,
      },
    },
  });
}

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest, { params }: Ctx) {
  const { token } = await params;
  const payload = verifyReviewToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, message: "This review link has expired or is invalid." }, { status: 400 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ success: false, message: "Invalid review data." }, { status: 400 });
  }

  const job = await prisma.job.findUnique({
    where: { id: payload.jobId },
    select: { status: true, review: { select: { id: true } } },
  });

  if (!job) {
    return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
  }
  if (job.status !== "COMPLETED") {
    return NextResponse.json({ success: false, message: "Reviews open after the repair is completed." }, { status: 422 });
  }
  if (job.review) {
    return NextResponse.json({ success: false, message: "This repair has already been reviewed." }, { status: 409 });
  }

  await prisma.jobReview.create({
    data: {
      jobId: payload.jobId,
      technicianId: payload.technicianId,
      rating: body.rating,
      text: body.text?.trim() || null,
    },
  });

  await logEvent({
    type: body.rating <= 2 ? "review.low_rating" : "review.submitted",
    actorType: "CUSTOMER",
    subjectType: "job",
    subjectId: payload.jobId,
    payload: { rating: body.rating, technicianId: payload.technicianId, hasText: !!body.text, via: "whatsapp_link" },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
