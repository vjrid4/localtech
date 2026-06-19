import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireTechnicianProfile } from "@/lib/marketplace";
import { logEvent } from "@/lib/events";
import { sendWhatsApp } from "@/lib/whatsapp";

/**
 * Job status engine (T14). Legal transitions only; COMPLETED auto-creates
 * the 30-day warranty and bumps the technician's counters. Quotes go
 * through the dedicated `quote` action so amount + status move together.
 */

const WARRANTY_DAYS = 30;

const TRANSITIONS: Record<string, string[]> = {
  ASSIGNED:       ["EN_ROUTE", "DIAGNOSED", "CANCELLED"],
  EN_ROUTE:       ["DIAGNOSED", "CANCELLED"],
  DIAGNOSED:      ["QUOTED", "CANCELLED"],            // via quote action
  QUOTED:         ["QUOTE_APPROVED", "CANCELLED"],     // approval is customer-side
  QUOTE_APPROVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS:    ["COMPLETED", "CANCELLED"],
};

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status"), status: z.enum(["EN_ROUTE", "DIAGNOSED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]), reason: z.string().optional() }),
  z.object({ action: z.literal("quote"), amountRupees: z.number().int().min(1).max(500000) }),
]);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
) {
  const { profile, errorResponse } = await requireTechnicianProfile(request);
  if (errorResponse) return errorResponse;

  const { jobId } = await context.params;
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.technicianId !== profile!.id) {
    return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 });
  }

  const target = body.action === "quote" ? "QUOTED" : body.status;
  const allowed = TRANSITIONS[job.status] ?? [];
  if (!allowed.includes(target)) {
    return NextResponse.json(
      { success: false, message: `Cannot move from ${job.status} to ${target}` },
      { status: 422 },
    );
  }

  const historyEntry = { status: target, at: new Date().toISOString(), by: "TECHNICIAN" };
  const booking = await prisma.bookingRequest.findUnique({
    where: { id: job.bookingId },
    select: { phone: true, reference: true },
  });
  const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in"}/track/${job.reference}`;

  const { updated, fieldVerifiedBadge } = await prisma.$transaction(async (tx) => {
    let fieldVerifiedBadge: { name: string; wa: string | null } | null = null;
    const u = await tx.job.update({
      where: { id: jobId },
      data: {
        status: target,
        statusHistory: { push: historyEntry },
        ...(body.action === "quote" ? { quoteAmount: body.amountRupees * 100 } : {}),
        ...(target === "COMPLETED" ? { completedAt: new Date() } : {}),
        ...(target === "CANCELLED" && body.action === "status" ? { cancelReason: body.reason ?? null } : {}),
      },
    });

    if (target === "COMPLETED") {
      await tx.jobWarranty.create({
        data: {
          jobId,
          expiresAt: new Date(Date.now() + WARRANTY_DAYS * 24 * 60 * 60 * 1000),
        },
      });
      const updatedProfile = await tx.technicianProfile.update({
        where: { id: profile!.id },
        data: { totalCompleted: { increment: 1 } },
        select: { totalCompleted: true, verificationLevel: true, whatsappNumber: true, user: { select: { name: true } } },
      });
      await tx.bookingRequest.update({
        where: { id: job.bookingId },
        data: { status: "CONVERTED" },
      });

      // T33: auto-badge FIELD_VERIFIED at 25 clean completed jobs
      if (
        updatedProfile.totalCompleted >= 25 &&
        updatedProfile.verificationLevel !== "FIELD_VERIFIED"
      ) {
        // Count jobs with open warranty claims (not "clean")
        const dirtyCount = await tx.jobWarrantyClaim.count({
          where: {
            warranty: { job: { technicianId: profile!.id } },
            status: { in: ["OPEN", "REDO_SCHEDULED"] },
          },
        });
        if (dirtyCount === 0) {
          await tx.technicianProfile.update({
            where: { id: profile!.id },
            data: { verificationLevel: "FIELD_VERIFIED" },
          });
          fieldVerifiedBadge = { name: updatedProfile.user.name, wa: updatedProfile.whatsappNumber };
        }
      }
    }
    if (target === "CANCELLED") {
      await tx.bookingRequest.update({
        where: { id: job.bookingId },
        data: { status: "CANCELLED" },
      });
    }
    return { updated: u, fieldVerifiedBadge };
  });

  await logEvent({
    type: body.action === "quote" ? "job.quoted" : `job.${target.toLowerCase()}`,
    actorType: "TECHNICIAN",
    actorId: profile!.userId,
    subjectType: "job",
    subjectId: jobId,
    payload: {
      from: job.status, to: target,
      ...(body.action === "quote" ? { amountPaise: body.amountRupees * 100 } : {}),
    },
  });

  // Customer notifications at the moments that matter
  if (booking) {
    if (body.action === "quote") {
      await sendWhatsApp({
        to: booking.phone,
        template: "quote_ready",
        params: { amount: `₹${body.amountRupees.toLocaleString("en-IN")}`, trackUrl },
        subjectType: "job",
        subjectId: jobId,
      });
    } else if (target === "COMPLETED") {
      await sendWhatsApp({
        to: booking.phone,
        template: "job_completed",
        params: { warrantyDays: String(WARRANTY_DAYS), trackUrl },
        subjectType: "job",
        subjectId: jobId,
      });
    }
  }

  if (fieldVerifiedBadge?.wa) {
    void sendWhatsApp({
      to: fieldVerifiedBadge.wa,
      template: "activation_congrats",
      params: {
        name: fieldVerifiedBadge.name,
        profileUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in"}/dashboard/technician/onboarding`,
      },
      subjectType: "technician_profile",
      subjectId: profile!.id,
    });
    await logEvent({
      type: "technician.field_verified",
      actorType: "SYSTEM",
      subjectType: "technician_profile",
      subjectId: profile!.id,
      payload: {},
    });
  }

  return NextResponse.json({ success: true, data: updated });
}
