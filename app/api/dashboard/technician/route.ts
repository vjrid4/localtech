import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);

  if (!auth.authenticated) {
    return createUnauthorizedResponse();
  }

  try {
    const technician = await prisma.technician.findFirst({
      where: {
        userId: auth.user!.userId,
      },
      include: {
        repairs: {
          where: {
            status: { not: "COMPLETED" },
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 15,
        },
      },
    });

    if (!technician) {
      return NextResponse.json(
        {
          success: false,
          message: "Technician profile not found",
        },
        { status: 404 }
      );
    }

    const totalRepairs = await prisma.repair.count({
      where: {
        technicianId: technician.id,
      },
    });

    const completedRepairs = await prisma.repair.count({
      where: {
        technicianId: technician.id,
        status: "COMPLETED",
      },
    });

    const reviews = await prisma.review.findMany({
      where: {
        technicianId: technician.id,
      },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          todaysJobs: technician.repairs.length,
          totalRepairs,
          successRate:
            totalRepairs > 0
              ? ((completedRepairs / totalRepairs) * 100).toFixed(1)
              : 0,
          avgRating: avgRating.toFixed(1),
          certifications: technician.certifications.length,
        },
        jobQueue: technician.repairs.map((repair: any) => ({
          id: repair.id,
          priority: repair.priority,
          issue: repair.issue,
          status: repair.status,
          createdAt: repair.createdAt,
          estimatedCost: repair.estimatedCost,
        })),
        specializations: technician.specialization,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch technician dashboard data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
