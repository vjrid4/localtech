import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);

  if (!auth.authenticated) {
    return createUnauthorizedResponse();
  }

  try {
    const shop = await prisma.repairShop.findFirst({
      where: {
        userId: auth.user!.userId,
      },
      include: {
        technicians: true,
        repairs: {
          where: {
            status: { not: "COMPLETED" },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          message: "Repair shop not found",
        },
        { status: 404 }
      );
    }

    const completedThisMonth = await prisma.repair.count({
      where: {
        repairShopId: shop.id,
        status: "COMPLETED",
        completionDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const totalRevenue = await prisma.invoice.aggregate({
      where: {
        repairShopId: shop.id,
        paymentStatus: "PAID",
      },
      _sum: {
        totalAmount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        shop: {
          id: shop.id,
          name: shop.name,
          city: shop.city,
          rating: shop.rating,
        },
        metrics: {
          activeRepairs: shop.repairs.length,
          completedThisMonth,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          activeTechnicians: shop.technicians.length,
        },
        recentRepairs: shop.repairs.map((repair: any) => ({
          id: repair.id,
          device: `${repair.issue}`,
          status: repair.status,
          estimatedCost: repair.estimatedCost,
          createdAt: repair.createdAt,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch shop dashboard data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
