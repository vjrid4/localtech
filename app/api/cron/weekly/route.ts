import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { isCronAuthorized } from "@/lib/cron-auth";
import { sendWhatsApp } from "@/lib/whatsapp";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

/**
 * Weekly cron — runs every day at 03:00 IST.
 *
 * 1. Warranty day-25 reminders:
 *    Warranties expiring in 5 days → customer gets a "claim before it's too late" nudge.
 *    Converts silent dissatisfaction into fixable claims (§11).
 *
 * 2. Technician weekly summaries (Monday only):
 *    Jobs completed in the past 7 days, estimated earnings, trust score.
 *    Keeps supply engaged and reinforces the ₹25K–₹60K/month income story.
 */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in";
  const now = new Date();
  const results = { warrantyReminders: 0, weeklySummaries: 0 };

  // ── 1. Warranty day-25 reminders ─────────────────────────────────────────
  // Warranties that expire between 4d23h and 5d1h from now (1h window to avoid duplicate runs)
  const expiryStart = new Date(now.getTime() + (5 * 24 - 1) * 60 * 60 * 1000);
  const expiryEnd   = new Date(now.getTime() + (5 * 24 + 1) * 60 * 60 * 1000);

  const warranties = await prisma.jobWarranty.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { gte: expiryStart, lt: expiryEnd },
      claims: { none: {} }, // no claim already filed
    },
    include: {
      job: {
        select: { reference: true, bookingId: true },
      },
    },
  });

  const bookingIds = warranties.map((w) => w.job.bookingId);
  const bookings = await prisma.bookingRequest.findMany({
    where: { id: { in: bookingIds } },
    select: { id: true, phone: true },
  });
  const phoneByBooking = new Map(bookings.map((b) => [b.id, b.phone]));

  for (const w of warranties) {
    const phone = phoneByBooking.get(w.job.bookingId);
    if (!phone) continue;
    await sendWhatsApp({
      to: phone,
      template: "warranty_reminder",
      params: { trackUrl: `${appUrl}/track/${w.job.reference}` },
      subjectType: "job_warranty",
      subjectId: w.id,
    });
    await logEvent({
      type: "warranty.reminder_sent",
      actorType: "SYSTEM",
      subjectType: "job_warranty",
      subjectId: w.id,
      payload: { expiresAt: w.expiresAt.toISOString() },
    });
    results.warrantyReminders++;
  }

  // ── 2. Technician weekly summaries (Monday only) ─────────────────────────
  const isMondayIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000).getDay() === 1;
  if (isMondayIST) {
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeTechs = await prisma.technicianProfile.findMany({
      where: { isActive: true },
      select: { id: true, whatsappNumber: true, trustScore: true, user: { select: { name: true } } },
    });

    for (const tech of activeTechs) {
      const weekJobs = await prisma.job.findMany({
        where: {
          technicianId: tech.id,
          status: "COMPLETED",
          completedAt: { gte: weekStart },
        },
        select: { commissionDue: true },
      });

      const completed = weekJobs.length;
      if (completed === 0) continue; // skip inactive this week

      const commissionPaise = weekJobs.reduce((s, j) => s + j.commissionDue, 0);
      // Commission due is the LocalTech fee owed by the technician;
      // estimate gross earnings as 10× commission (assuming 10% rate)
      const estimatedEarningsRs = Math.round((commissionPaise * 10) / 100);

      await sendWhatsApp({
        to: tech.whatsappNumber,
        template: "weekly_summary",
        params: {
          name: tech.user.name,
          completed: String(completed),
          earned: estimatedEarningsRs.toLocaleString("en-IN"),
          score: String(Math.round(tech.trustScore)),
        },
        subjectType: "technician_profile",
        subjectId: tech.id,
      });
      results.weeklySummaries++;
    }
  }

  return NextResponse.json({ success: true, ...results });
}
