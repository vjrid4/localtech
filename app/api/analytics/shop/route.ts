import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const auth = await authenticateToken(request);

  if (!auth.authenticated) {
    return createUnauthorizedResponse();
  }

  try {
    const shop = await prisma.repairShop.findFirst({
      where: {
        userId: auth.user!.userId,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, message: "Shop not found" },
        { status: 404 }
      );
    }

    // Get date range for analytics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Repair statistics
    const repairsThisMonth = await prisma.repair.count({
      where: {
        repairShopId: shop.id,
        createdAt: { gte: startOfMonth },
      },
    });

    const repairsThisYear = await prisma.repair.count({
      where: {
        repairShopId: shop.id,
        createdAt: { gte: startOfYear },
      },
    });

    const completedThisMonth = await prisma.repair.count({
      where: {
        repairShopId: shop.id,
        status: "COMPLETED",
        completionDate: { gte: startOfMonth },
      },
    });

    // Revenue statistics
    const revenueThisMonth = await prisma.invoice.aggregate({
      where: {
        repairShopId: shop.id,
        paymentStatus: "PAID",
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    });

    const revenueThisYear = await prisma.invoice.aggregate({
      where: {
        repairShopId: shop.id,
        paymentStatus: "PAID",
        createdAt: { gte: startOfYear },
      },
      _sum: { totalAmount: true },
    });

    // Repair status breakdown
    const repairsByStatus = await prisma.repair.groupBy({
      by: ["status"],
      where: { repairShopId: shop.id },
      _count: true,
    });

    // Device brand breakdown
    const repairsByBrand = await prisma.repair.groupBy({
      by: ["deviceId"],
      where: { repairShopId: shop.id },
      _count: true,
    });

    // Top technicians
    const topTechnicians = await prisma.technician.findMany({
      where: { repairShopId: shop.id },
      select: {
        id: true,
        user: { select: { name: true } },
        totalRepairs: true,
        rating: true,
        _count: { select: { repairs: true } },
      },
      orderBy: { totalRepairs: "desc" },
      take: 5,
    });

    // Repair turnaround time analysis
    const completedRepairs = await prisma.repair.findMany({
      where: {
        repairShopId: shop.id,
        status: "COMPLETED",
        completionDate: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      select: {
        id: true,
        createdAt: true,
        completionDate: true,
      },
    });

    const avgTurnaroundTime =
      completedRepairs.length > 0
        ? Math.round(
            completedRepairs.reduce((sum: number, r: any) => {
              const days =
                (r.completionDate!.getTime() - r.createdAt.getTime()) /
                (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / completedRepairs.length
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          repairsThisMonth,
          repairsThisYear,
          completedThisMonth,
          revenueThisMonth: revenueThisMonth._sum.totalAmount || 0,
          revenueThisYear: revenueThisYear._sum.totalAmount || 0,
          avgTurnaroundTime, // in days
        },
        repairStatus: Object.fromEntries(
          repairsByStatus.map((r: any) => [r.status, r._count])
        ),
        topTechnicians: topTechnicians.map((t: any) => ({
          name: t.user.name,
          totalRepairs: t.totalRepairs,
          currentRepairs: t._count.repairs,
          rating: t.rating,
        })),
        chartData: {
          monthlyRevenue: await getMonthlyRevenue(shop.id),
          repairTrend: await getRepairTrend(shop.id),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function getMonthlyRevenue(
  shopId: string
): Promise<Array<{ month: string; revenue: number }>> {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const revenue = await prisma.invoice.aggregate({
      where: {
        repairShopId: shopId,
        paymentStatus: "PAID",
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { totalAmount: true },
    });

    months.push({
      month: startOfMonth.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      revenue: revenue._sum.totalAmount || 0,
    });
  }
  return months;
}

async function getRepairTrend(
  shopId: string
): Promise<Array<{ week: string; count: number }>> {
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const count = await prisma.repair.count({
      where: {
        repairShopId: shopId,
        createdAt: { gte: startOfWeek, lte: endOfWeek },
      },
    });

    weeks.push({
      week: `W${Math.floor(i / 7) + 1}`,
      count,
    });
  }
  return weeks;
}
