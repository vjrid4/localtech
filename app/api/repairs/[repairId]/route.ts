import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken } from "@/lib/auth/middleware";

const updateRepairSchema = z.object({
  status: z.enum([
    "RECEIVED",
    "DIAGNOSED",
    "QUOTED",
    "APPROVED",
    "IN_PROGRESS",
    "COMPLETED",
    "DELIVERED",
    "CANCELLED",
  ]).optional(),
  diagnosis: z.string().optional(),
  solution: z.string().optional(),
  estimatedCost: z.number().optional(),
  finalCost: z.number().optional(),
  technicianId: z.string().optional(),
});

// GET repair details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ repairId: string }> }
) {
  try {
    const { repairId } = await params;

    const repair = await prisma.repair.findUnique({
      where: { id: repairId },
      include: {
        customer: true,
        device: true,
        technician: true,
        repairShop: true,
        estimate: true,
        invoice: true,
        partsUsed: {
          include: {
            sparePart: true,
          },
        },
      },
    });

    if (!repair) {
      return NextResponse.json(
        { success: false, message: "Repair not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: repair,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch repair",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH update repair
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ repairId: string }> }
) {
  const auth = authenticateToken(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { repairId } = await params;
    const body = await request.json();
    const updateData = updateRepairSchema.parse(body);

    const updates: any = { ...updateData };

    // If status changes to COMPLETED, set completion date
    if (updateData.status === "COMPLETED") {
      updates.completionDate = new Date();
    }

    const repair = await prisma.repair.update({
      where: { id: repairId },
      data: updates,
      include: {
        customer: true,
        device: true,
        technician: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Repair updated successfully",
      data: repair,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update repair",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
