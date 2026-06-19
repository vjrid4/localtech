import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";

/**
 * GET /api/technician/referral
 * Returns the technician's referral code, share URL, wallet balance, and transaction history.
 */
export async function GET(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "TECHNICIAN");
  if (errorResponse) return errorResponse;

  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: auth.user!.userId },
    select: {
      referralCode: true,
      walletBalance: true,
      walletTxs: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!profile) return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in";
  const referredCount = profile.referralCode
    ? await prisma.technicianProfile.count({ where: { referredBy: profile.referralCode } })
    : 0;
  const activatedCount = profile.referralCode
    ? await prisma.technicianProfile.count({ where: { referredBy: profile.referralCode, isActive: true } })
    : 0;

  return NextResponse.json({
    success: true,
    data: {
      referralCode: profile.referralCode,
      shareUrl: profile.referralCode
        ? `${appUrl}/apply/technician?ref=${profile.referralCode}`
        : null,
      walletBalance: profile.walletBalance, // paise
      walletBalanceRupees: profile.walletBalance / 100,
      referredCount,
      activatedCount,
      transactions: profile.walletTxs,
    },
  });
}
