import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken } from "@/lib/auth/middleware";

const estimateSchema = z.object({
  repairShopId: z.string().optional(),
  customerId: z.string().optional(),
  repairId: z.string().optional(),
  issueDescription: z.string(),
  estimatedCost: z.number().min(0),
  laborCharge: z.number().min(0),
  partsCharge: z.number().min(0),
  diagnosis: z.string().optional(),
  validUntil: z.string().datetime().optional(),
});

// GET estimates
export async function GET(request: NextRequest) {
  const auth = await authenticateToken(request);

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
  const auth = await authenticateToken(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const estimateData = estimateSchema.parse(body);

    // Resolve shop + customer — either from repairId (preferred) or explicit IDs
    let resolvedShopId: string;
    let resolvedCustomerId: string;

    if (estimateData.repairId) {
      const repair = await prisma.repair.findUnique({
        where: { id: estimateData.repairId },
        select: { repairShopId: true, customerId: true, repairShop: { select: { userId: true } } },
      });
      if (!repair) return NextResponse.json({ success: false, message: "Repair not found" }, { status: 404 });
      if (repair.repairShop.userId !== auth.user!.userId)
        return NextResponse.json({ success: false, message: "Unauthorized shop access" }, { status: 403 });
      resolvedShopId = repair.repairShopId;
      resolvedCustomerId = repair.customerId;
    } else {
      // Legacy path: explicit repairShopId + customerId
      if (!estimateData.repairShopId || !estimateData.customerId)
        return NextResponse.json({ success: false, message: "Provide repairId or both repairShopId and customerId" }, { status: 400 });

      const shop = await prisma.repairShop.findUnique({ where: { id: estimateData.repairShopId } });
      if (!shop || shop.userId !== auth.user!.userId)
        return NextResponse.json({ success: false, message: "Unauthorized shop access" }, { status: 403 });

      const customer = await prisma.customer.findUnique({ where: { id: estimateData.customerId } });
      if (!customer || customer.repairShopId !== shop.id)
        return NextResponse.json({ success: false, message: "Customer does not belong to this shop" }, { status: 400 });

      resolvedShopId = shop.id;
      resolvedCustomerId = customer.id;
    }

    // Generate estimate number
    const estimateCount = await prisma.estimate.count();
    const estimateNumber = `EST-${Date.now()}-${estimateCount + 1}`;

    const estimate = await prisma.estimate.create({
      data: {
        repairShopId: resolvedShopId,
        customerId: resolvedCustomerId,
        issueDescription: estimateData.issueDescription,
        estimatedCost: estimateData.estimatedCost,
        laborCharge: estimateData.laborCharge,
        partsCharge: estimateData.partsCharge,
        diagnosis: estimateData.diagnosis,
        estimateNumber,
        status: "PENDING",
        validUntil: estimateData.validUntil
          ? new Date(estimateData.validUntil)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
