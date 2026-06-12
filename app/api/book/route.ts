import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { logEvent } from "@/lib/events";
import { createDispatch } from "@/lib/dispatch";

const bookSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  city: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  deviceType: z.enum(["mobile", "tv", "laptop", "appliance", "cctv", "solar"]),
  deviceBrand: z.string().optional(),
  deviceModel: z.string().optional(),
  issueDescription: z.string().min(5),
});

function generateRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "LT-";
  for (let i = 0; i < 7; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bookSchema.parse(body);

    // Deduplicate references (extremely rare collision, but safe)
    let reference = generateRef();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.bookingRequest.findUnique({ where: { reference } });
      if (!exists) break;
      reference = generateRef();
      attempts++;
    }

    const booking = await prisma.bookingRequest.create({
      data: {
        reference,
        name: data.name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        pincode: data.pincode,
        deviceType: data.deviceType,
        deviceBrand: data.deviceBrand,
        deviceModel: data.deviceModel,
        issueDescription: data.issueDescription,
        status: "PENDING",
      },
    });

    await logEvent({
      type: "booking.created",
      actorType: "CUSTOMER",
      subjectType: "booking",
      subjectId: booking.id,
      payload: { reference: booking.reference, deviceType: data.deviceType, city: data.city, pincode: data.pincode },
    });

    // Fire the dispatch engine — wave 0 offers go out immediately.
    // Failures never block the booking (createDispatch catches internally).
    await createDispatch(booking.id);

    return NextResponse.json({ success: true, data: { reference: booking.reference } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to submit booking" }, { status: 500 });
  }
}
