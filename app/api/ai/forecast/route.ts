import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  forecastPartsDemand,
  predictRepairDemand,
  recommendSupplierOrders,
} from "@/lib/ai/forecasting";
import { authenticateToken } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";

const forecastSchema = z.object({
  shopId: z.string(),
  days: z.number().min(1).max(365).default(30),
  type: z.enum(["parts", "repairs", "orders"]).default("parts"),
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
    const { shopId, days, type } = forecastSchema.parse(body);

    // Verify shop ownership
    const shop = await prisma.repairShop.findUnique({
      where: { id: shopId },
    });

    if (!shop || shop.userId !== auth.user!.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized shop access" },
        { status: 403 }
      );
    }

    let forecast = null;

    switch (type) {
      case "parts":
        forecast = await forecastPartsDemand(shopId, days);
        break;
      case "repairs":
        forecast = await predictRepairDemand(shopId, days);
        break;
      case "orders":
        forecast = await recommendSupplierOrders(shopId);
        break;
    }

    return NextResponse.json({
      success: true,
      data: forecast,
      generatedAt: new Date().toISOString(),
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
        message: "Forecasting failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
