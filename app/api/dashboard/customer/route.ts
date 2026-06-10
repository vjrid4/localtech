import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const auth = await authenticateToken(request);

  if (!auth.authenticated) {
    return createUnauthorizedResponse();
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: {
        userId: auth.user!.userId,
      },
      include: {
        devices: { include: { healthPassport: true } },
        repairs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        warranties: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer profile not found",
        },
        { status: 404 }
      );
    }

    const completedRepairs = await prisma.repair.count({
      where: {
        customerId: customer.id,
        status: "COMPLETED",
      },
    });

    const totalSpent = await prisma.invoice.aggregate({
      where: {
        repairId: {
          in: (
            await prisma.repair.findMany({
              where: { customerId: customer.id },
              select: { id: true },
            })
          ).map((r: any) => r.id),
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalDevices: customer.devices.length,
          completedRepairs,
          activeWarranties: customer.warranties.filter((w: any) => w.isActive)
            .length,
          totalSpent: totalSpent._sum.totalAmount || 0,
        },
        devices: customer.devices.map((device: any) => ({
          id: device.id,
          brand: device.brand,
          model: device.model,
          color: device.color,
          healthScore: device.healthPassport?.healthScore ?? null,
          batteryHealth: device.healthPassport?.batteryHealth ?? null,
          lastRepairDate: device.healthPassport?.lastRepairDate ?? null,
          repairCount: device.healthPassport?.repairCount ?? 0,
        })),
        recentRepairs: customer.repairs.map((repair: any) => ({
          id: repair.id,
          issue: repair.issue,
          status: repair.status,
          completionDate: repair.completionDate,
          finalCost: repair.finalCost,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch customer dashboard data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
