import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { logEvent } from "@/lib/events";

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  const filter = request.nextUrl.searchParams.get("filter"); // "pending" | "active" | all
  const where =
    filter === "pending" ? { isActive: false } :
    filter === "active"  ? { isActive: true } : undefined;

  const technicians = await prisma.technicianProfile.findMany({
    where,
    include: { user: { select: { name: true, phone: true, email: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ success: true, data: technicians });
}

const patchSchema = z.object({
  id: z.string(),
  isActive: z.boolean().optional(),
  verificationLevel: z.enum(["UNVERIFIED", "ID_VERIFIED", "FIELD_VERIFIED"]).optional(),
  acceptingJobs: z.boolean().optional(),
  categories: z.array(z.enum(["mobile", "tv", "laptop", "appliance", "cctv", "solar"])).min(1).optional(),
  pincodes: z.array(z.string().regex(/^\d{6}$/)).max(20).optional(),
});

export async function PATCH(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  try {
    const { id, ...changes } = patchSchema.parse(await request.json());
    const before = await prisma.technicianProfile.findUnique({
      where: { id },
      select: { isActive: true, verificationLevel: true, referredBy: true },
    });
    if (!before) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    const updated = await prisma.technicianProfile.update({ where: { id }, data: changes });

    const eventType =
      changes.isActive === true ? "technician.activated" :
      changes.isActive === false ? "technician.suspended" :
      "technician.updated";
    await logEvent({
      type: eventType,
      actorType: "ADMIN",
      actorId: auth.user!.userId,
      subjectType: "technician",
      subjectId: id,
      payload: { before, after: changes },
    });

    // T31: Referral credits — ₹100 to both sides on first activation
    if (changes.isActive === true && !before.isActive && before.referredBy) {
      const referrer = await prisma.technicianProfile.findUnique({
        where: { referralCode: before.referredBy },
        select: { id: true },
      });
      if (referrer) {
        const BONUS_PAISE = 10000; // ₹100
        await prisma.$transaction([
          // Referrer earns ₹100
          prisma.technicianProfile.update({
            where: { id: referrer.id },
            data: { walletBalance: { increment: BONUS_PAISE } },
          }),
          prisma.walletTx.create({
            data: { techId: referrer.id, type: "CREDIT", amount: BONUS_PAISE, reason: "referral_earned", refId: id },
          }),
          // New tech earns ₹100
          prisma.technicianProfile.update({
            where: { id },
            data: { walletBalance: { increment: BONUS_PAISE } },
          }),
          prisma.walletTx.create({
            data: { techId: id, type: "CREDIT", amount: BONUS_PAISE, reason: "referral_bonus", refId: referrer.id },
          }),
        ]);
        await logEvent({
          type: "referral.credited",
          actorType: "SYSTEM",
          subjectType: "technician",
          subjectId: id,
          payload: { referrerId: referrer.id, bonusPaise: BONUS_PAISE },
        });
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}
