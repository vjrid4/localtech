import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  const status = request.nextUrl.searchParams.get("status");
  const bookings = await prisma.bookingRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ success: true, data: bookings });
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "ASSIGNED", "CONVERTED", "CANCELLED"]),
});

export async function PATCH(request: NextRequest) {
  const { errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  try {
    const { id, status } = patchSchema.parse(await request.json());
    const booking = await prisma.bookingRequest.update({ where: { id }, data: { status } });
    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}
