import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { diagnoseDevice, analyzeRepairHistory } from "@/lib/ai/diagnosis";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken } from "@/lib/auth/middleware";

const diagnosisSchema = z.object({
  deviceBrand: z.string(),
  deviceModel: z.string(),
  issueDescription: z.string(),
  symptoms: z.array(z.string()).optional(),
  deviceId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const auth = authenticateToken(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { deviceBrand, deviceModel, issueDescription, symptoms, deviceId } =
      diagnosisSchema.parse(body);

    // Call AI diagnosis engine (Phase 3)
    const diagnosis = await diagnoseDevice({
      deviceBrand,
      deviceModel,
      issueDescription,
      symptoms,
    });

    // If device ID provided, verify ownership then analyze repair history
    let historyAnalysis = null;
    if (deviceId) {
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: { healthPassport: true, customer: true },
      });

      if (!device) {
        return NextResponse.json(
          { success: false, message: "Device not found" },
          { status: 404 }
        );
      }

      // SECURITY: Only the device owner, their shop, or a linked technician can request analysis
      const isCustomerOwner = device.customer.userId === auth.user!.userId;
      const isShopOwner = await prisma.repairShop.findFirst({
        where: { userId: auth.user!.userId, customers: { some: { id: device.customerId } } },
      });
      const isTechnician = await prisma.technician.findFirst({
        where: { userId: auth.user!.userId, repairShopId: { in: (isShopOwner ? [isShopOwner.id] : []) } },
      });

      if (!isCustomerOwner && !isShopOwner && !isTechnician) {
        return NextResponse.json(
          { success: false, message: "Unauthorized device access" },
          { status: 403 }
        );
      }

      historyAnalysis = await analyzeRepairHistory(deviceId);
    }

    return NextResponse.json({
      success: true,
      data: {
        diagnosis,
        historyAnalysis,
        timestamp: new Date().toISOString(),
      },
      message: "AI diagnosis completed successfully",
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
        message: "Diagnosis failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
