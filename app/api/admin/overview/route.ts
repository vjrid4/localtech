import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  const [
    pendingBookings,
    totalBookings,
    newLeads,
    totalLeads,
    totalUsers,
    totalRepairs,
    recentBookings,
    recentLeads,
  ] = await Promise.all([
    prisma.bookingRequest.count({ where: { status: "PENDING" } }),
    prisma.bookingRequest.count(),
    prisma.businessLead.count({ where: { status: "NEW" } }),
    prisma.businessLead.count(),
    prisma.user.count(),
    prisma.repair.count(),
    prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.businessLead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      pendingBookings,
      totalBookings,
      newLeads,
      totalLeads,
      totalUsers,
      totalRepairs,
      recentBookings,
      recentLeads,
    },
  });
}
