import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { diagnoseDevice, analyzeRepairHistory } from "@/lib/ai/diagnosis";
import { prisma } from "@/lib/db/prisma";

const diagnosisSchema = z.object({
  deviceBrand: z.string(),
  deviceModel: z.string(),
  issueDescription: z.string(),
  symptoms: z.array(z.string()).optional(),
  deviceId: z.string().optional(),
});

export async function POST(request: NextRequest) {
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

    // If device ID provided, analyze repair history
    let historyAnalysis = null;
    if (deviceId) {
      historyAnalysis = await analyzeRepairHistory(deviceId);

      // Update device health passport with predictive data
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: { healthPassport: true },
      });

      if (device?.healthPassport) {
        // AI insights would update health metrics here in Phase 3
      }
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
