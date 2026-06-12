import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

/**
 * Trust score recompute (T21) — nightly via host crontab.
 *
 * score = bayesian rating avg (prior 4.2, weight 5) scaled to 0–100
 *         − 10 pts per warranty redo, floored at 0, capped at 100.
 *
 * New technicians without reviews sit at the prior (~84 × prior/5 ≈ 84)…
 * scaled: 4.2/5 → 84. Redos bite hard by design — the warranty is the
 * measurement instrument. This score feeds DIRECTLY into dispatch ranking
 * (eligibleTechnicians orders by trustScore desc), closing the flywheel:
 * good work → higher score → earlier offers.
 */
const PRIOR_RATING = 4.2;
const PRIOR_WEIGHT = 5;
const REDO_PENALTY = 10;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided =
    request.nextUrl.searchParams.get("secret") ?? request.headers.get("x-cron-secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const profiles = await prisma.technicianProfile.findMany({
      where: { isActive: true },
      select: { id: true, totalRedos: true },
    });

    const ratings = await prisma.jobReview.groupBy({
      by: ["technicianId"],
      _avg: { rating: true },
      _count: { rating: true },
    });
    const ratingMap = new Map(ratings.map((r) => [r.technicianId, r]));

    let updated = 0;
    for (const p of profiles) {
      const r = ratingMap.get(p.id);
      const count = r?._count.rating ?? 0;
      const avg = r?._avg.rating ?? 0;
      const bayesian =
        (PRIOR_RATING * PRIOR_WEIGHT + avg * count) / (PRIOR_WEIGHT + count);
      const score = Math.max(0, Math.min(100, bayesian * 20 - p.totalRedos * REDO_PENALTY));

      await prisma.technicianProfile.update({
        where: { id: p.id },
        data: { trustScore: Math.round(score * 10) / 10 },
      });
      updated++;
    }

    await logEvent({
      type: "trust.recomputed",
      actorType: "SYSTEM",
      subjectType: "system",
      subjectId: "trust-score-cron",
      payload: { profiles: updated },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("[cron:trust-score]", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
