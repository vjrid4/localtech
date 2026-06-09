import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const deviceSchema = z.object({
  customerId: z.string(),
  brand: z.string(),
  model: z.string(),
  imei: z.string().optional(),
  serialNumber: z.string().optional(),
  color: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchasePrice: z.number().optional(),
});

// GET all devices for a customer
export async function GET(request: NextRequest) {
  try {
    const customerId = request.nextUrl.searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: "customerId is required" },
        { status: 400 }
      );
    }

    // TODO: Fetch devices from database
    // const devices = await prisma.device.findMany({...})

    return NextResponse.json({
      success: true,
      data: [],
      message: "Devices fetched successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch devices",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST create new device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const device = deviceSchema.parse(body);

    // TODO: Create device in database
    // const newDevice = await prisma.device.create({...})

    return NextResponse.json(
      {
        success: true,
        message: "Device created successfully",
        data: device,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create device",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
