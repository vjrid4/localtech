import { prisma } from "@/lib/db/prisma";
import { logEvent } from "@/lib/events";
import { sendWhatsApp } from "@/lib/whatsapp";

/**
 * Dispatch engine v1 — wave-based broadcast with single-winner atomic accept.
 * (90-day plan §5.) No queues, no ML: a ranked query + a 60s cron.
 *
 *   wave 0 → top 3 eligible technicians, offers expire in 10 min
 *   wave 1 → next 5, after 10 min without acceptance
 *   wave 2 → everyone remaining
 *   30 min without assignment → EXPIRED_TO_MANUAL (admin alert)
 */

const WAVE_SIZES = [3, 5, Infinity];
const OFFER_TTL_MS = 10 * 60 * 1000;
const WAVE_INTERVAL_MS = 10 * 60 * 1000;
const MANUAL_FALLBACK_MS = 30 * 60 * 1000;

/** Active, accepting technicians matching category — pincode narrows when present. */
export async function eligibleTechnicians(category: string, pincode: string | null) {
  return prisma.technicianProfile.findMany({
    where: {
      isActive: true,
      acceptingJobs: true,
      categories: { has: category },
      ...(pincode ? { pincodes: { has: pincode } } : {}),
    },
    orderBy: [{ trustScore: "desc" }, { totalCompleted: "asc" }],
    select: { id: true, userId: true, whatsappNumber: true, user: { select: { name: true } } },
  });
}

/** Create the Dispatch for a booking and fire wave 0. Never throws. */
export async function createDispatch(bookingId: string): Promise<void> {
  try {
    const dispatch = await prisma.dispatch.create({ data: { bookingId } });
    await logEvent({
      type: "dispatch.created",
      actorType: "SYSTEM",
      subjectType: "dispatch",
      subjectId: dispatch.id,
      payload: { bookingId },
    });
    await runWave(dispatch.id);
  } catch (err) {
    console.error("[dispatch] createDispatch failed", err);
  }
}

/** Send the next wave of offers for a dispatch. */
export async function runWave(dispatchId: string): Promise<void> {
  const dispatch = await prisma.dispatch.findUnique({
    where: { id: dispatchId },
    include: { booking: true, offers: { select: { technicianId: true } } },
  });
  if (!dispatch || !["PENDING", "OFFERED"].includes(dispatch.status)) return;
  if (dispatch.wave >= WAVE_SIZES.length) return;

  const alreadyOffered = new Set(dispatch.offers.map((o) => o.technicianId));
  const candidates = (
    await eligibleTechnicians(dispatch.booking.deviceType, dispatch.booking.pincode)
  ).filter((t) => !alreadyOffered.has(t.id));

  const size = WAVE_SIZES[dispatch.wave];
  const batch = size === Infinity ? candidates : candidates.slice(0, size);

  if (batch.length === 0) {
    // Nobody to offer to in this wave — bump the wave counter anyway so the
    // escalation clock keeps moving toward the manual fallback.
    await prisma.dispatch.update({ where: { id: dispatchId }, data: { wave: { increment: 1 } } });
    return;
  }

  const expiresAt = new Date(Date.now() + OFFER_TTL_MS);
  await prisma.dispatchOffer.createMany({
    data: batch.map((t) => ({ dispatchId, technicianId: t.id, expiresAt })),
    skipDuplicates: true,
  });
  await prisma.dispatch.update({
    where: { id: dispatchId },
    data: { status: "OFFERED", wave: { increment: 1 } },
  });

  const b = dispatch.booking;
  for (const t of batch) {
    await logEvent({
      type: "offer.sent",
      actorType: "SYSTEM",
      subjectType: "dispatch",
      subjectId: dispatchId,
      payload: { technicianId: t.id, wave: dispatch.wave },
    });
    await sendWhatsApp({
      to: t.whatsappNumber,
      template: "job_offer",
      params: {
        device: [b.deviceBrand, b.deviceModel].filter(Boolean).join(" ") || b.deviceType,
        issue: b.issueDescription.slice(0, 80),
        area: b.pincode ?? b.city ?? "your area",
        reference: b.reference,
      },
      subjectType: "dispatch",
      subjectId: dispatchId,
    });
  }
}

/**
 * Atomically assign a technician (first-accept-wins) and create the Job.
 * Used by both the technician accept endpoint and admin manual assignment.
 * Returns the Job on success, null if someone else already won.
 */
export async function assignTechnician(opts: {
  dispatchId: string;
  technicianId: string;
  actorType: "TECHNICIAN" | "ADMIN";
  actorId?: string;
}) {
  const result = await prisma.$transaction(async (tx) => {
    // Conditional claim — count===0 means another technician beat them to it
    const claimed = await tx.dispatch.updateMany({
      where: { id: opts.dispatchId, status: { in: ["PENDING", "OFFERED", "EXPIRED_TO_MANUAL"] } },
      data: { status: "ASSIGNED", assignedTechId: opts.technicianId, assignedAt: new Date() },
    });
    if (claimed.count === 0) return null;

    const dispatch = await tx.dispatch.findUniqueOrThrow({
      where: { id: opts.dispatchId },
      include: { booking: true },
    });

    // Winner's offer → ACCEPTED (if one exists; manual assign may not have one)
    await tx.dispatchOffer.updateMany({
      where: { dispatchId: opts.dispatchId, technicianId: opts.technicianId },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
    // Everyone else's outstanding offers → EXPIRED
    await tx.dispatchOffer.updateMany({
      where: { dispatchId: opts.dispatchId, status: "SENT" },
      data: { status: "EXPIRED" },
    });

    const job = await tx.job.create({
      data: {
        reference: dispatch.booking.reference,
        bookingId: dispatch.bookingId,
        technicianId: opts.technicianId,
        statusHistory: [{ status: "ASSIGNED", at: new Date().toISOString(), by: opts.actorType }],
      },
    });
    await tx.bookingRequest.update({
      where: { id: dispatch.bookingId },
      data: { status: "ASSIGNED" },
    });
    return { job, booking: dispatch.booking };
  });

  if (!result) return null;

  await logEvent({
    type: opts.actorType === "ADMIN" ? "admin.manual_assign" : "offer.accepted",
    actorType: opts.actorType,
    actorId: opts.actorId,
    subjectType: "job",
    subjectId: result.job.id,
    payload: { dispatchId: opts.dispatchId, technicianId: opts.technicianId, reference: result.job.reference },
  });

  // Notify the customer that help is on the way
  const tech = await prisma.technicianProfile.findUnique({
    where: { id: opts.technicianId },
    select: { trustScore: true, totalCompleted: true, user: { select: { name: true } } },
  });
  await sendWhatsApp({
    to: result.booking.phone,
    template: "technician_assigned",
    params: {
      name: tech?.user.name ?? "Your technician",
      score: String(Math.round(tech?.trustScore ?? 50)),
      repairs: String(tech?.totalCompleted ?? 0),
      trackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in"}/track/${result.job.reference}`,
    },
    subjectType: "job",
    subjectId: result.job.id,
  });

  return result.job;
}

/**
 * Cron tick (every 60s): expire stale offers, escalate quiet dispatches to
 * the next wave, and hand long-stuck ones to the admin.
 */
export async function escalateStale(): Promise<{ expired: number; escalated: number; toManual: number }> {
  const now = new Date();

  // 1. Expire offers past their TTL
  const { count: expired } = await prisma.dispatchOffer.updateMany({
    where: { status: "SENT", expiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });

  // 2. Open dispatches: escalate or hand to manual
  const open = await prisma.dispatch.findMany({
    where: { status: { in: ["PENDING", "OFFERED"] } },
    select: { id: true, wave: true, createdAt: true, updatedAt: true },
  });

  let escalated = 0;
  let toManual = 0;
  for (const d of open) {
    const age = now.getTime() - d.createdAt.getTime();
    const sinceLastWave = now.getTime() - d.updatedAt.getTime();

    if (age >= MANUAL_FALLBACK_MS) {
      await prisma.dispatch.update({ where: { id: d.id }, data: { status: "EXPIRED_TO_MANUAL" } });
      await logEvent({
        type: "dispatch.expired_to_manual",
        actorType: "SYSTEM",
        subjectType: "dispatch",
        subjectId: d.id,
        payload: { ageMinutes: Math.round(age / 60000), wavesSent: d.wave },
      });
      toManual++;
    } else if (d.wave < WAVE_SIZES.length && sinceLastWave >= WAVE_INTERVAL_MS) {
      await runWave(d.id);
      await logEvent({
        type: "dispatch.escalated",
        actorType: "SYSTEM",
        subjectType: "dispatch",
        subjectId: d.id,
        payload: { toWave: d.wave + 1 },
      });
      escalated++;
    }
  }

  return { expired, escalated, toManual };
}
