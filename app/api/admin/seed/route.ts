import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const TEST_PASSWORD = "password@!23";

const SEEDS = [
  { email: "shop@example.com",     name: "Raj's Mobile Repairs", userType: "REPAIR_SHOP_OWNER" as const, phone: "9876543210" },
  { email: "tech@example.com",     name: "Ajay Kumar",           userType: "TECHNICIAN"         as const, phone: "9876543211" },
  { email: "customer@example.com", name: "Priya Sharma",         userType: "CUSTOMER"           as const, phone: "9876543212" },
  { email: "supplier@example.com", name: "Tech Parts India",     userType: "SUPPLIER"           as const, phone: "9876543213" },
];

/**
 * POST /api/admin/seed
 * Create-only — never touches existing accounts (prevents blind password reset on real users).
 * Protected by CRON_SECRET (hard-fails 503 when unset).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ success: false, message: "Seed disabled — CRON_SECRET not configured" }, { status: 503 });
  }
  const provided = request.headers.get("x-cron-secret") ?? request.headers.get("x-seed-secret") ?? "";
  if (!provided || provided.length !== secret.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(secret))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const pw = await hash(TEST_PASSWORD, 10);
  const results: { email: string; action: "created" | "skipped" }[] = [];

  for (const seed of SEEDS) {
    const existing = await prisma.user.findUnique({ where: { email: seed.email }, select: { id: true } });
    if (existing) {
      // Never touch existing accounts — a real user may own this email
      results.push({ email: seed.email, action: "skipped" });
      continue;
    }

    const user = await prisma.user.create({
      data: { email: seed.email, name: seed.name, phone: seed.phone, password: pw, userType: seed.userType },
    });

    if (seed.userType === "REPAIR_SHOP_OWNER") {
      const shop = await prisma.repairShop.create({
        data: {
          userId: user.id,
          name: seed.name,
          phone: seed.phone,
          email: seed.email,
          street: "123 Market Street",
          city: "Hyderabad",
          state: "Telangana",
          zipCode: "500001",
          country: "India",
        },
      });
      await prisma.branch.create({
        data: {
          repairShopId: shop.id,
          name: "Main Branch",
          street: "123 Market Street",
          city: "Hyderabad",
          state: "Telangana",
          zipCode: "500001",
          phone: seed.phone,
          email: seed.email,
        },
      });
    } else if (seed.userType === "CUSTOMER") {
      await prisma.customer.create({ data: { userId: user.id } });
    } else if (seed.userType === "SUPPLIER") {
      await prisma.supplier.create({
        data: {
          userId: user.id,
          companyName: seed.name,
          street: "45 Trade Park",
          city: "Bangalore",
          state: "Karnataka",
          zipCode: "560001",
        },
      });
    } else if (seed.userType === "TECHNICIAN") {
      // Attach explicitly to the seeded shop owner — never to a random tenant
      const seedShop = await prisma.repairShop.findFirst({
        where: { user: { email: "shop@example.com" } },
        select: { id: true, branches: { select: { id: true }, take: 1 } },
      });
      if (seedShop?.branches[0]) {
        await prisma.technician.create({
          data: {
            userId: user.id,
            repairShopId: seedShop.id,
            branchId: seedShop.branches[0].id,
            specialization: ["iPhone", "Samsung", "OnePlus"],
            certifications: [],
          },
        });
      }
    }

    results.push({ email: seed.email, action: "created" });
  }

  return NextResponse.json({ success: true, message: "Seed complete", results });
}
