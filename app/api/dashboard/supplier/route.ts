import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);

  if (!auth.authenticated) {
    return createUnauthorizedResponse();
  }

  try {
    const supplier = await prisma.supplier.findFirst({
      where: {
        userId: auth.user!.userId,
      },
      include: {
        orders: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        spareParts: true,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        {
          success: false,
          message: "Supplier profile not found",
        },
        { status: 404 }
      );
    }

    const totalOrders = await prisma.supplyOrder.count({
      where: {
        supplierId: supplier.id,
      },
    });

    const thisMonthRevenue = await prisma.supplyOrder.aggregate({
      where: {
        supplierId: supplier.id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const topProducts = await prisma.sparePart.findMany({
      where: {
        supplierId: supplier.id,
      },
      include: {
        repairParts: true,
      },
      orderBy: {
        repairParts: {
          _count: "desc",
        },
      },
      take: 3,
    });

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalOrders,
          thisMonthRevenue: thisMonthRevenue._sum.totalAmount || 0,
          rating: supplier.rating,
          activeProducts: supplier.spareParts.length,
        },
        recentOrders: supplier.orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
        })),
        topProducts: topProducts.map((part: any) => ({
          id: part.id,
          name: part.name,
          sold: part.repairParts.length,
          sellingPrice: part.sellingPrice,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch supplier dashboard data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
