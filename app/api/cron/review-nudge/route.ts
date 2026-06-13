import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { isCronAuthorized } from "@/lib/cron-auth";
import { sendWhatsApp } from "@/lib/whatsapp";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

/**
 * Review nudge cron — runs hourly.
 * Wave 1 (4h post-completion): first review request.
 * Wave 2 (48h post-completion): reminder for non-responders.
 * Target ≥45% review submission (90-day plan §10).
 */

type JobRow = {
  id: string;
  reference: string;
  bookingId: string;
  technician: { user: { name: string } };
};

async function nudgeWave(jobs: JobRow[], template: "review_request" | "review_reminder", appUrl: string) {
  const bookingIds = jobs.map((j) => j.bookingId);
  const bookings = await prisma.bookingRequest.findMany({
    where: { id: { in: bookingIds } },
    select: { id: true, phone: true },
  });
  const phoneMap = new Map(bookings.map((b) => [b.id, b.phone]));

  let sent = 0;
  for (const job of jobs) {
    const phone = phoneMap.get(job.bookingId);
    if (!phone) continue;
    await sendWhatsApp({
      to: phone,
      template,
      params: { techName: job.technician.user.name, reviewUrl: `${appUrl}/track/${job.reference}` },
      subjectType: "job",
      subjectId: job.id,
    });
    if (template === "review_request") {
      await logEvent({ type: "review.requested", actorType: "SYSTEM", subjectType: "job", subjectId: job.id });
    }
    sent++;
  }
  return sent;
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in";
  const now = new Date();

  const jobSelect = {
    id: true, reference: true, bookingId: true,
    technician: { select: { user: { select: { name: true } } } },
  } as const;

  // Wave 1: completed 4–5h ago, no review yet
  const wave1Start = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const wave1End   = new Date(now.getTime() - 4 * 60 * 60 * 1000);

  // Wave 2: completed 48–49h ago, still no review
  const wave2Start = new Date(now.getTime() - 49 * 60 * 60 * 1000);
  const wave2End   = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const [wave1Jobs, wave2Jobs] = await Promise.all([
    prisma.job.findMany({
      where: { status: "COMPLETED", completedAt: { gte: wave1Start, lt: wave1End }, review: null },
      select: jobSelect,
    }),
    prisma.job.findMany({
      where: { status: "COMPLETED", completedAt: { gte: wave2Start, lt: wave2End }, review: null },
      select: jobSelect,
    }),
  ]);

  const [s1, s2] = await Promise.all([
    nudgeWave(wave1Jobs, "review_request", appUrl),
    nudgeWave(wave2Jobs, "review_reminder", appUrl),
  ]);

  return NextResponse.json({ success: true, wave1Sent: s1, wave2Sent: s2 });
}
