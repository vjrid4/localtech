import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { logEvent } from "@/lib/events";

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  city: z.string().optional(),
  leadType: z.enum(["REPAIR_SHOP_OWNER", "TECHNICIAN", "SUPPLIER"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = leadSchema.parse(body);

    const lead = await prisma.businessLead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        leadType: data.leadType,
        status: "NEW",
      },
    });

    await logEvent({
      type: "lead.created",
      actorType: "CUSTOMER",
      subjectType: "lead",
      subjectId: lead.id,
      payload: { leadType: lead.leadType, city: lead.city },
    });

    return NextResponse.json({ success: true, data: { id: lead.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to submit enquiry" }, { status: 500 });
  }
}
