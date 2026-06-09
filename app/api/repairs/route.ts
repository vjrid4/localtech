import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const repairSchema = z.object({
  customerId: z.string(),
  deviceId: z.string(),
  repairShopId: z.string(),
  issue: z.string(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

// GET repairs (filter by shop, customer, or status)
export async function GET(request: NextRequest) {
  try {
    const repairShopId = request.nextUrl.searchParams.get("repairShopId");
    const customerId = request.nextUrl.searchParams.get("customerId");
    const status = request.nextUrl.searchParams.get("status");

    // TODO: Build dynamic query
    // const repairs = await prisma.repair.findMany({...})

    return NextResponse.json({
      success: true,
      data: [],
      message: "Repairs fetched successfully",
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
  try {
    const body = await request.json();
    const repairData = repairSchema.parse(body);

    // TODO: Create repair in database
    // const repair = await prisma.repair.create({...})

    return NextResponse.json(
      {
        success: true,
        message: "Repair created successfully",
        data: repairData,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create repair",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
