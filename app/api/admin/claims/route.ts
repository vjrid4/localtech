import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { createDispatch } from "@/lib/dispatch";
import { logEvent } from "@/lib/events";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  const openOnly = request.nextUrl.searchParams.get("open") === "1";
  const claims = await prisma.jobWarrantyClaim.findMany({
    where: openOnly ? { status: "OPEN" } : undefined,
    include: {
      warranty: {
        include: {
          job: {
            select: {
              reference: true, bookingId: true, quoteAmount: true, completedAt: true,
              technician: { select: { id: true, user: { select: { name: true } } } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Attach customer contact from the booking
  const bookingIds = claims.map((c) => c.warranty.job.bookingId);
  const bookings = await prisma.bookingRequest.findMany({
    where: { id: { in: bookingIds } },
    select: { id: true, name: true, phone: true, deviceType: true, deviceBrand: true, deviceModel: true, city: true, pincode: true, issueDescription: true },
  });
  const bMap = new Map(bookings.map((b) => [b.id, b]));

  return NextResponse.json({
    success: true,
    data: claims.map((c) => ({
      id: c.id,
      status: c.status,
      description: c.description,
      createdAt: c.createdAt,
      redoJobId: c.redoJobId,
      job: c.warranty.job,
      booking: bMap.get(c.warranty.job.bookingId) ?? null,
    })),
  });
}

const patchSchema = z.object({
  id: z.string(),
  action: z.enum(["redo", "resolve", "reject"]),
});

export async function PATCH(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  try {
    const { id, action } = patchSchema.parse(await request.json());
    const claim = await prisma.jobWarrantyClaim.findUnique({
      where: { id },
      include: { warranty: { include: { job: { select: { reference: true, bookingId: true, technicianId: true } } } } },
    });
    if (!claim) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    if (action === "redo") {
      // Clone the original booking as a ₹0 redo and run it through the normal
      // dispatch flow. Admin assigns from the board (typically a DIFFERENT
      // technician — the original's redo counts against their score).
      const original = await prisma.bookingRequest.findUniqueOrThrow({
        where: { id: claim.warranty.job.bookingId },
      });
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let reference = "LT-";
      for (let i = 0; i < 7; i++) reference += chars[Math.floor(Math.random() * chars.length)];

      const redoBooking = await prisma.bookingRequest.create({
        data: {
          reference,
          name: original.name,
          phone: original.phone,
          email: original.email,
          city: original.city,
          pincode: original.pincode,
          deviceType: original.deviceType,
          deviceBrand: original.deviceBrand,
          deviceModel: original.deviceModel,
          issueDescription: `[WARRANTY REDO of ${claim.warranty.job.reference}] ${claim.description}`,
          status: "PENDING",
        },
      });

      await prisma.$transaction([
        prisma.jobWarrantyClaim.update({
          where: { id },
          data: { status: "REDO_SCHEDULED", redoJobId: redoBooking.id },
        }),
        prisma.technicianProfile.update({
          where: { id: claim.warranty.job.technicianId },
          data: { totalRedos: { increment: 1 } },
        }),
      ]);
      await createDispatch(redoBooking.id);

      await logEvent({
        type: "warranty.redo_scheduled",
        actorType: "ADMIN",
        actorId: auth.user!.userId,
        subjectType: "claim",
        subjectId: id,
        payload: { redoReference: reference, originalReference: claim.warranty.job.reference, technicianId: claim.warranty.job.technicianId },
      });
      return NextResponse.json({ success: true, data: { redoReference: reference } });
    }

    const newStatus = action === "resolve" ? "RESOLVED" : "REJECTED";
    await prisma.jobWarrantyClaim.update({
      where: { id },
      data: { status: newStatus, resolvedAt: new Date() },
    });
    await logEvent({
      type: `warranty.claim_${action}d`,
      actorType: "ADMIN",
      actorId: auth.user!.userId,
      subjectType: "claim",
      subjectId: id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}
