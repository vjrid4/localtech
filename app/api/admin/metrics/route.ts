import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

// ISO week label: "Jun W2"
function weekLabel(d: Date): string {
  const month = d.toLocaleDateString("en-IN", { month: "short" });
  const day = d.getDate();
  const w = Math.ceil(day / 7);
  return `${month} W${w}`;
}

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mon-based
  const mon = new Date(d);
  mon.setDate(diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  const now = new Date();
  const d7ago = new Date(now.getTime() - 7 * 86400_000);
  const d48ago = new Date(now.getTime() - 48 * 3600_000);
  const d56ago = new Date(now.getTime() - 56 * 86400_000);
  const weekStart = startOfWeek(now);

  const [
    // Demand funnel — all-time
    totalBookings,
    dispatchedCount,
    assignedCount,
    completedCount,
    reviewedCount,
    bookingsThisWeek,
    completedThisWeek,
    // Supply health
    totalProfiles,
    idVerifiedCount,
    fieldVerifiedCount,
    activeCount,
    weeklyActiveJobs,
    totalOffersSent,
    acceptedOffers,
    leagueProfiles,
    // Quality
    ratingAgg,
    openClaims,
    staleClaims,
    redoAgg,
    // Economics (completed jobs with quote)
    economicsAgg,
    // Chart data (last 8 weeks)
    recentBookings,
    recentCompletions,
  ] = await Promise.all([
    // ── Demand ──
    prisma.bookingRequest.count(),
    prisma.dispatch.count(),
    prisma.job.count(),
    prisma.job.count({ where: { status: "COMPLETED" } }),
    prisma.jobReview.count(),
    prisma.bookingRequest.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.job.count({ where: { status: "COMPLETED", completedAt: { gte: weekStart } } }),

    // ── Supply ──
    prisma.technicianProfile.count(),
    prisma.technicianProfile.count({ where: { verificationLevel: { in: ["ID_VERIFIED", "FIELD_VERIFIED"] } } }),
    prisma.technicianProfile.count({ where: { verificationLevel: "FIELD_VERIFIED" } }),
    prisma.technicianProfile.count({ where: { isActive: true } }),
    prisma.job.findMany({
      where: { status: "COMPLETED", completedAt: { gte: d7ago } },
      select: { technicianId: true },
      distinct: ["technicianId"],
    }),
    prisma.dispatchOffer.count({ where: { sentAt: { gte: d7ago } } }),
    prisma.dispatchOffer.count({ where: { status: "ACCEPTED", respondedAt: { gte: d7ago } } }),
    prisma.technicianProfile.findMany({
      orderBy: { totalCompleted: "desc" },
      take: 10,
      select: {
        publicSlug: true,
        trustScore: true,
        totalCompleted: true,
        totalRedos: true,
        isActive: true,
        verificationLevel: true,
        user: { select: { name: true } },
      },
    }),

    // ── Quality ──
    prisma.jobReview.aggregate({ _avg: { rating: true }, _count: true }),
    prisma.jobWarrantyClaim.count({ where: { status: "OPEN" } }),
    prisma.jobWarrantyClaim.count({ where: { status: "OPEN", createdAt: { lte: d48ago } } }),
    prisma.technicianProfile.aggregate({ _sum: { totalRedos: true, totalCompleted: true } }),

    // ── Economics ──
    prisma.job.aggregate({
      where: { status: "COMPLETED" },
      _avg: { quoteAmount: true },
      _sum: { commissionDue: true },
      _count: true,
    }),

    // ── Chart (raw lists, grouped in JS) ──
    prisma.bookingRequest.findMany({
      where: { createdAt: { gte: d56ago } },
      select: { createdAt: true },
    }),
    prisma.job.findMany({
      where: { status: "COMPLETED", completedAt: { gte: d56ago } },
      select: { completedAt: true },
    }),
  ]);

  // Build 8-week chart buckets (Mon–Sun)
  const buckets: { week: string; bookings: number; completed: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekMonday = new Date(weekStart.getTime() - i * 7 * 86400_000);
    const weekSunday = new Date(weekMonday.getTime() + 7 * 86400_000);
    buckets.push({
      week: weekLabel(weekMonday),
      bookings: recentBookings.filter((b) => b.createdAt >= weekMonday && b.createdAt < weekSunday).length,
      completed: recentCompletions.filter((j) => j.completedAt! >= weekMonday && j.completedAt! < weekSunday).length,
    });
  }

  const completionRate = totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0;
  const reviewRate = completedCount > 0 ? Math.round((reviewedCount / completedCount) * 100) : 0;
  const weeklyActiveCount = weeklyActiveJobs.length;
  const acceptanceRate = totalOffersSent > 0 ? Math.round((acceptedOffers / totalOffersSent) * 100) : 0;
  const totalRedos = redoAgg._sum.totalRedos ?? 0;
  const totalCompletedAll = redoAgg._sum.totalCompleted ?? 0;
  const redoRate = totalCompletedAll > 0 ? Math.round((totalRedos / totalCompletedAll) * 100) : 0;
  const avgJobValueRs = economicsAgg._avg.quoteAmount ? Math.round(economicsAgg._avg.quoteAmount / 100) : 0;
  const totalCommissionDueRs = economicsAgg._sum.commissionDue ? Math.round(economicsAgg._sum.commissionDue / 100) : 0;
  const avgCommissionRs = economicsAgg._count > 0 ? Math.round(totalCommissionDueRs / economicsAgg._count) : 0;

  return NextResponse.json({
    success: true,
    data: {
      funnel: {
        allTime: {
          bookings: totalBookings,
          dispatched: dispatchedCount,
          assigned: assignedCount,
          completed: completedCount,
          reviewed: reviewedCount,
          completionRate,
        },
        thisWeek: { bookings: bookingsThisWeek, completed: completedThisWeek },
        weeklyChart: buckets,
      },
      supply: {
        applied: totalProfiles,
        idVerified: idVerifiedCount,
        fieldVerified: fieldVerifiedCount,
        active: activeCount,
        weeklyActive: weeklyActiveCount,
        acceptanceRate,
        leagueTable: leagueProfiles.map((p) => ({
          name: p.user.name,
          slug: p.publicSlug,
          completed: p.totalCompleted,
          redos: p.totalRedos,
          trustScore: Math.round(p.trustScore),
          isActive: p.isActive,
          verificationLevel: p.verificationLevel,
        })),
      },
      quality: {
        avgRating: ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : null,
        reviewCount: ratingAgg._count,
        reviewRate,
        redoRate,
        openClaims,
        staleClaims,
      },
      economics: {
        completedJobs: economicsAgg._count,
        avgJobValueRs,
        totalCommissionDueRs,
        avgCommissionRs,
        commissionCollectedRs: 0, // wire after Razorpay (T25)
      },
    },
  });
}
