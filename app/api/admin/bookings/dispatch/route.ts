import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { createDispatch } from "@/lib/dispatch";
import { logEvent } from "@/lib/events";

/**
 * Send a booking to the dispatch engine (admin). Covers bookings created
 * before the engine existed and any that need re-dispatching. Resets the
 * booking to PENDING (a manually-set ASSIGNED label without a Job is
 * meaningless) and fires wave 0.
 */
const schema = z.object({ bookingId: z.string() });

export async function POST(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  try {
    const { bookingId } = schema.parse(await request.json());
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: bookingId },
      include: { dispatch: { select: { id: true, status: true } } },
    });
    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }
    if (booking.dispatch) {
      return NextResponse.json(
        { success: false, message: `Already dispatched (${booking.dispatch.status}) — manage it on the Dispatch board` },
        { status: 409 },
      );
    }
    const job = await prisma.job.findUnique({ where: { reference: booking.reference }, select: { id: true } });
    if (job) {
      return NextResponse.json({ success: false, message: "A job already exists for this booking" }, { status: 409 });
    }

    await prisma.bookingRequest.update({ where: { id: bookingId }, data: { status: "PENDING" } });
    await createDispatch(bookingId);

    await logEvent({
      type: "admin.booking_dispatched",
      actorType: "ADMIN",
      actorId: auth.user!.userId,
      subjectType: "booking",
      subjectId: bookingId,
      payload: { reference: booking.reference },
    });

    return NextResponse.json({ success: true, data: { reference: booking.reference } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Dispatch failed" }, { status: 500 });
  }
}
