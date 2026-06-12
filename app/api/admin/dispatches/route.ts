import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { assignTechnician, eligibleTechnicians } from "@/lib/dispatch";
import { logEvent } from "@/lib/events";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  const open = request.nextUrl.searchParams.get("open") === "1";
  const dispatches = await prisma.dispatch.findMany({
    where: open ? { status: { in: ["PENDING", "OFFERED", "EXPIRED_TO_MANUAL"] } } : undefined,
    include: {
      booking: {
        select: {
          reference: true, name: true, phone: true, deviceType: true,
          deviceBrand: true, deviceModel: true, issueDescription: true,
          city: true, pincode: true, createdAt: true,
        },
      },
      offers: {
        include: { technician: { select: { id: true, user: { select: { name: true } } } } },
        orderBy: { sentAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // For each open dispatch, surface who COULD take it (manual-assign options)
  const withCandidates = await Promise.all(
    dispatches.map(async (d) => {
      if (!["PENDING", "OFFERED", "EXPIRED_TO_MANUAL"].includes(d.status)) {
        return { ...d, candidates: [] };
      }
      const candidates = await eligibleTechnicians(d.booking.deviceType, d.booking.pincode);
      return {
        ...d,
        candidates: candidates.map((c) => ({ id: c.id, name: c.user.name })),
      };
    }),
  );

  return NextResponse.json({ success: true, data: withCandidates });
}

const assignSchema = z.object({
  dispatchId: z.string(),
  technicianId: z.string(),
});

/** Manual assignment override — same atomic path as technician acceptance. */
export async function POST(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  try {
    const { dispatchId, technicianId } = assignSchema.parse(await request.json());
    const job = await assignTechnician({
      dispatchId,
      technicianId,
      actorType: "ADMIN",
      actorId: auth.user!.userId,
    });
    if (!job) {
      return NextResponse.json({ success: false, message: "Dispatch already assigned" }, { status: 409 });
    }
    return NextResponse.json({ success: true, data: { jobId: job.id, reference: job.reference } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Assignment failed" }, { status: 500 });
  }
}

const cancelSchema = z.object({ dispatchId: z.string(), action: z.literal("cancel") });

export async function PATCH(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  try {
    const { dispatchId } = cancelSchema.parse(await request.json());
    const dispatch = await prisma.dispatch.update({
      where: { id: dispatchId },
      data: { status: "CANCELLED" },
    });
    await prisma.dispatchOffer.updateMany({
      where: { dispatchId, status: "SENT" },
      data: { status: "EXPIRED" },
    });
    await prisma.bookingRequest.update({
      where: { id: dispatch.bookingId },
      data: { status: "CANCELLED" },
    });
    await logEvent({
      type: "admin.dispatch_cancelled",
      actorType: "ADMIN",
      actorId: auth.user!.userId,
      subjectType: "dispatch",
      subjectId: dispatchId,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Cancel failed" }, { status: 500 });
  }
}
