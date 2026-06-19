import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "vjrid4@gmail.com";

function verifyCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev passthrough
  return request.headers.get("x-cron-secret") === secret;
}

function rupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCron(request)) return NextResponse.json({ success: false }, { status: 401 });

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  // Booking stats
  const [totalBookings, assignedBookings, pendingBookings] = await Promise.all([
    prisma.bookingRequest.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.bookingRequest.count({ where: { createdAt: { gte: weekStart }, status: { in: ["ASSIGNED", "CONVERTED"] } } }),
    prisma.bookingRequest.count({ where: { createdAt: { gte: weekStart }, status: "PENDING" } }),
  ]);

  // Job stats
  const completedJobs = await prisma.job.findMany({
    where: { completedAt: { gte: weekStart } },
    select: { quoteAmount: true, commissionDue: true, technicianId: true },
  });
  const jobRevenuePaise = completedJobs.reduce((s, j) => s + (j.quoteAmount ?? 0), 0);
  const commissionPaise = completedJobs.reduce((s, j) => s + (j.commissionDue ?? 0), 0);

  // Technician stats
  const [activeTechs, newTechs] = await Promise.all([
    prisma.technicianProfile.count({ where: { isActive: true } }),
    prisma.technicianProfile.count({ where: { createdAt: { gte: weekStart } } }),
  ]);

  // Top 5 techs this week by completed jobs
  const techJobCounts: Record<string, number> = {};
  for (const j of completedJobs) techJobCounts[j.technicianId] = (techJobCounts[j.technicianId] ?? 0) + 1;
  const topTechIds = Object.entries(techJobCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  const topTechs = topTechIds.length
    ? await prisma.technicianProfile.findMany({
        where: { id: { in: topTechIds } },
        select: { id: true, user: { select: { name: true } } },
      })
    : [];

  // New reviews this week
  const newReviews = await prisma.jobReview.count({ where: { createdAt: { gte: weekStart } } });
  const avgRating = await prisma.jobReview.aggregate({
    _avg: { rating: true },
    where: { createdAt: { gte: weekStart } },
  });

  const weekLabel = weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const todayLabel = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const topTechRows = topTechs
    .map((t) => `<tr><td style="padding:4px 12px">${t.user.name}</td><td style="padding:4px 12px;text-align:center">${techJobCounts[t.id]}</td></tr>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body{font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#f5f5f0;margin:0;padding:20px}
  .card{background:#fff;border-radius:12px;padding:24px;margin-bottom:16px;max-width:600px}
  h1{color:#16a34a;font-size:22px;margin:0 0 4px}
  .sub{color:#888;font-size:13px;margin:0 0 20px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
  .stat{background:#f9fafb;border-radius:8px;padding:12px 16px}
  .stat-label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.05em}
  .stat-value{font-size:24px;font-weight:700;color:#111;margin-top:2px}
  .stat-value.green{color:#16a34a}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#f3f4f6;padding:6px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
  tr:nth-child(even){background:#fafafa}
  .footer{font-size:11px;color:#aaa;text-align:center;margin-top:16px}
</style></head>
<body>
<div class="card">
  <h1>LocalTech Weekly Metrics</h1>
  <p class="sub">${weekLabel} → ${todayLabel}</p>

  <div class="grid">
    <div class="stat"><div class="stat-label">New Bookings</div><div class="stat-value">${totalBookings}</div></div>
    <div class="stat"><div class="stat-label">Assigned / Converted</div><div class="stat-value green">${assignedBookings}</div></div>
    <div class="stat"><div class="stat-label">Still Pending</div><div class="stat-value">${pendingBookings}</div></div>
    <div class="stat"><div class="stat-label">Jobs Completed</div><div class="stat-value green">${completedJobs.length}</div></div>
    <div class="stat"><div class="stat-label">Revenue (quotes)</div><div class="stat-value">${rupees(jobRevenuePaise)}</div></div>
    <div class="stat"><div class="stat-label">Platform Commission</div><div class="stat-value green">${rupees(commissionPaise)}</div></div>
    <div class="stat"><div class="stat-label">Active Techs</div><div class="stat-value">${activeTechs}</div></div>
    <div class="stat"><div class="stat-label">New Applications</div><div class="stat-value">${newTechs}</div></div>
    <div class="stat"><div class="stat-label">New Reviews</div><div class="stat-value">${newReviews}</div></div>
    <div class="stat"><div class="stat-label">Avg Rating (week)</div><div class="stat-value">${avgRating._avg.rating?.toFixed(1) ?? "–"} ⭐</div></div>
  </div>

  ${topTechRows ? `
  <b style="font-size:13px">Top technicians this week</b>
  <table style="margin-top:8px">
    <tr><th>Name</th><th style="text-align:center">Jobs</th></tr>
    ${topTechRows}
  </table>` : ""}
</div>
<p class="footer">LocalTech · localtech.in · automated weekly digest</p>
</body></html>`;

  const text = [
    `LocalTech Weekly Metrics (${weekLabel} → ${todayLabel})`,
    `Bookings: ${totalBookings} total, ${assignedBookings} assigned, ${pendingBookings} still pending`,
    `Jobs completed: ${completedJobs.length}  Revenue: ${rupees(jobRevenuePaise)}  Commission: ${rupees(commissionPaise)}`,
    `Techs: ${activeTechs} active, ${newTechs} new applications`,
    `Reviews: ${newReviews} new, avg ${avgRating._avg.rating?.toFixed(1) ?? "–"}`,
  ].join("\n");

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `LocalTech week of ${weekLabel} — ${completedJobs.length} jobs, ${rupees(commissionPaise)} commission`,
    html,
    text,
  });

  return NextResponse.json({
    success: true,
    data: { bookings: totalBookings, completedJobs: completedJobs.length, revenuePaise: jobRevenuePaise, commissionPaise, activeTechs, newTechs, newReviews },
  });
}
