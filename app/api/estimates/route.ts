import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken } from "@/lib/auth/middleware";

const estimateSchema = z.object({
  repairShopId: z.string(),
  customerId: z.string(),
  issueDescription: z.string(),
  estimatedCost: z.number().min(0),
  laborCharge: z.number().min(0),
  partsCharge: z.number().min(0),
  diagnosis: z.string().optional(),
  validUntil: z.string().datetime().optional(),
});

// GET estimates
export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // SECURITY: Scope to authenticated user's resources (ignore query params for authorization)
    const shop = await prisma.repairShop.findFirst({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });

    const where: any = {};
    if (shop) {
      where.repairShopId = shop.id;
    } else {
      // For customers, only show their estimates
      const customer = await prisma.customer.findFirst({
        where: { userId: auth.user!.userId },
        select: { id: true },
      });
      if (customer) {
        where.customerId = customer.id;
      } else {
        return NextResponse.json(
          { success: false, message: "User role not found" },
          { status: 404 }
        );
      }
    }

    const estimates = await prisma.estimate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: estimates,
      count: estimates.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch estimates",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST create estimate
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
    const estimateData = estimateSchema.parse(body);

    // SECURITY: Verify shop ownership (don't trust repairShopId from body)
    const shop = await prisma.repairShop.findUnique({
      where: { id: estimateData.repairShopId },
    });

    if (!shop || shop.userId !== auth.user!.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized shop access" },
        { status: 403 }
      );
    }

    // Verify customer belongs to this shop
    const customer = await prisma.customer.findUnique({
      where: { id: estimateData.customerId },
    });

    if (!customer || customer.repairShopId !== shop.id) {
      return NextResponse.json(
        { success: false, message: "Customer does not belong to this shop" },
        { status: 400 }
      );
    }

    // Generate estimate number
    const estimateCount = await prisma.estimate.count();
    const estimateNumber = `EST-${Date.now()}-${estimateCount + 1}`;

    const estimate = await prisma.estimate.create({
      data: {
        ...estimateData,
        estimateNumber,
        status: "PENDING",
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Estimate created successfully",
        data: estimate,
      },
      { status: 201 }
    );
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
        message: "Failed to create estimate",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
