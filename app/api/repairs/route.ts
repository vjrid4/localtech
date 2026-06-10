import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken } from "@/lib/auth/middleware";

const repairSchema = z.object({
  customerId: z.string(),
  deviceId: z.string(),
  repairShopId: z.string(),
  branchId: z.string(),
  issue: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  estimatedCost: z.number().optional(),
  technicianId: z.string().optional(),
});

// GET repairs (filter by shop, customer, or status)
export async function GET(request: NextRequest) {
  const auth = await authenticateToken(request);

  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const customQueryShopId = request.nextUrl.searchParams.get("repairShopId");
    const customQueryCustomerId = request.nextUrl.searchParams.get("customerId");
    const status = request.nextUrl.searchParams.get("status");
    const uninvoiced = request.nextUrl.searchParams.get("uninvoiced");
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50"), 100);

    // SECURITY: Scope queries to authenticated user's resources
    const where: any = {};

    // If user is a shop owner, can only see their repairs
    const shop = await prisma.repairShop.findFirst({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });

    if (shop) {
      where.repairShopId = shop.id;
    } else {
      // If user is a customer, can only see their repairs
      const customer = await prisma.customer.findFirst({
        where: { userId: auth.user!.userId },
        select: { id: true },
      });
      if (customer) {
        where.customerId = customer.id;
      } else {
        // Technician: can see repairs assigned to them
        const tech = await prisma.technician.findFirst({
          where: { userId: auth.user!.userId },
          select: { id: true },
        });
        if (tech) {
          where.technicianId = tech.id;
        } else {
          return NextResponse.json(
            { success: false, message: "User role not found" },
            { status: 404 }
          );
        }
      }
    }

    if (status) where.status = status;
    if (uninvoiced === "1") {
      where.status = "COMPLETED";
      where.invoice = { is: null };
    }

    const repairs = await prisma.repair.findMany({
      where,
      include: {
        customer: { include: { user: { select: { name: true, phone: true, email: true } } } },
        device: true,
        technician: { include: { user: { select: { name: true } } } },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: repairs,
      count: repairs.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch repairs",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST create new repair
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
    const repairData = repairSchema.parse(body);

    // SECURITY: Verify shop ownership
    const shop = await prisma.repairShop.findUnique({
      where: { id: repairData.repairShopId },
    });

    if (!shop || shop.userId !== auth.user!.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized shop access" },
        { status: 403 }
      );
    }

    const repair = await prisma.repair.create({
      data: {
        ...repairData,
        status: "RECEIVED",
      },
      include: {
        customer: true,
        device: true,
        repairShop: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Repair created successfully",
        data: repair,
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
        message: "Failed to create repair",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
