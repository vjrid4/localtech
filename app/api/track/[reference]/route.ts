import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Public booking tracker — no auth, looked up by the unguessable LT-XXXXXXX
 * reference. Returns booking status now; job/technician/warranty fields are
 * structured in already so the page upgrades automatically as the dispatch
 * engine (T10+) starts filling them.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ reference: string }> },
) {
  const { reference } = await context.params;
  const ref = reference?.toUpperCase().trim();

  if (!ref || !/^LT-[A-Z2-9]{7}$/.test(ref)) {
    return NextResponse.json({ success: false, message: "Invalid reference" }, { status: 400 });
  }

  const booking = await prisma.bookingRequest.findUnique({
    where: { reference: ref },
    select: {
      reference: true,
      status: true,
      deviceType: true,
      deviceBrand: true,
      deviceModel: true,
      issueDescription: true,
      city: true,
      createdAt: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
  }

  // Job layer (filled once dispatch assigns a technician)
  const job = await prisma.job.findUnique({
    where: { reference: ref },
    select: {
      status: true,
      quoteAmount: true,
      completedAt: true,
      technician: {
        select: {
          publicSlug: true,
          photoUrl: true,
          trustScore: true,
          totalCompleted: true,
          user: { select: { name: true } },
        },
      },
      warranty: {
        select: {
          startsAt: true, expiresAt: true, status: true,
          claims: { select: { status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      review: { select: { rating: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      booking,
      job: job
        ? {
            status: job.status,
            quoteAmount: job.quoteAmount,
            completedAt: job.completedAt,
            technician: job.technician
              ? {
                  name: job.technician.user.name,
                  slug: job.technician.publicSlug,
                  photoUrl: job.technician.photoUrl,
                  trustScore: Math.round(job.technician.trustScore),
                  totalCompleted: job.technician.totalCompleted,
                }
              : null,
            warranty: job.warranty,
            review: job.review,
          }
        : null,
    },
  });
}
