import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireTechnicianProfile } from "@/lib/marketplace";

/** Technician's world: live offers + active jobs + recent history. */
export async function GET(request: NextRequest) {
  const { profile, errorResponse } = await requireTechnicianProfile(request);
  if (errorResponse) return errorResponse;

  const now = new Date();
  const [offers, active, recent] = await Promise.all([
    prisma.dispatchOffer.findMany({
      where: {
        technicianId: profile!.id,
        status: "SENT",
        expiresAt: { gt: now },
        dispatch: { status: "OFFERED" },
      },
      include: {
        dispatch: {
          include: {
            booking: {
              select: {
                reference: true, deviceType: true, deviceBrand: true, deviceModel: true,
                issueDescription: true, city: true, pincode: true, createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { sentAt: "desc" },
    }),
    prisma.job.findMany({
      where: {
        technicianId: profile!.id,
        status: { in: ["ASSIGNED", "EN_ROUTE", "DIAGNOSED", "QUOTED", "QUOTE_APPROVED", "IN_PROGRESS"] },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.findMany({
      where: { technicianId: profile!.id, status: { in: ["COMPLETED", "CANCELLED"] } },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  // Attach customer/booking details to jobs (booking holds contact info)
  const bookingIds = [...active, ...recent].map((j) => j.bookingId);
  const bookings = await prisma.bookingRequest.findMany({
    where: { id: { in: bookingIds } },
    select: {
      id: true, name: true, phone: true, deviceType: true, deviceBrand: true,
      deviceModel: true, issueDescription: true, city: true, pincode: true,
    },
  });
  const bookingMap = new Map(bookings.map((b) => [b.id, b]));

  return NextResponse.json({
    success: true,
    data: {
      offers: offers.map((o) => ({
        id: o.id,
        expiresAt: o.expiresAt,
        booking: o.dispatch.booking,
      })),
      active: active.map((j) => ({ ...j, booking: bookingMap.get(j.bookingId) ?? null })),
      recent: recent.map((j) => ({ ...j, booking: bookingMap.get(j.bookingId) ?? null })),
    },
  });
}
