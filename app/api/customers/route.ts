import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { authenticateToken, createUnauthorizedResponse } from "@/lib/auth/middleware";

const createCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional(),
});

// GET — search customers by phone or name (scoped to caller's shop)
export async function GET(request: NextRequest) {
  const auth = await authenticateToken(request);
  if (!auth.authenticated) return createUnauthorizedResponse();

  const q = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const shop = await prisma.repairShop.findFirst({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });
    if (!shop) return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });

    const customers = await prisma.customer.findMany({
      where: {
        repairShopId: shop.id,
        user: q
          ? {
              OR: [
                { phone: { contains: q } },
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        devices: { select: { id: true, brand: true, model: true, color: true } },
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: customers.map((c: any) => ({
        id: c.id,
        name: c.user.name,
        email: c.user.email,
        phone: c.user.phone,
        devices: c.devices,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to search customers" },
      { status: 500 }
    );
  }
}

// POST — create a new customer (creates User + Customer records)
export async function POST(request: NextRequest) {
  const auth = await authenticateToken(request);
  if (!auth.authenticated) return createUnauthorizedResponse();

  try {
    const body = await request.json();
    const { name, phone, email } = createCustomerSchema.parse(body);

    const shop = await prisma.repairShop.findFirst({
      where: { userId: auth.user!.userId },
      select: { id: true },
    });
    if (!shop) return NextResponse.json({ success: false, message: "Shop not found" }, { status: 404 });

    // Use provided email or generate one from phone
    const resolvedEmail = email ?? `${phone.replace(/\D/g, "")}@customer.devicedna.in`;

    // Check if a customer with this email already belongs to THIS shop
    const ownShopCustomer = await prisma.customer.findFirst({
      where: { repairShopId: shop.id, user: { email: resolvedEmail } },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        devices: { select: { id: true, brand: true, model: true, color: true } },
      },
    });
    if (ownShopCustomer) {
      return NextResponse.json({ success: true, data: ownShopCustomer, existed: true });
    }

    // Check if the email is taken by a user at a DIFFERENT shop — reject without leaking PII
    const emailTaken = await prisma.user.findUnique({ where: { email: resolvedEmail }, select: { id: true } });
    if (emailTaken) {
      return NextResponse.json(
        { success: false, message: "A customer with this contact is already registered with another shop. Use a different email address." },
        { status: 409 }
      );
    }

    // Use a random credential — the phone number is a discoverable identifier,
    // not a secret. Customer login requires a password-reset flow.
    const password = await bcrypt.hash(randomBytes(32).toString("base64url"), 10);

    const user = await prisma.user.create({
      data: { email: resolvedEmail, password, name, phone, userType: "CUSTOMER" },
    });

    const customer = await prisma.customer.create({
      data: { userId: user.id, repairShopId: shop.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        devices: { select: { id: true, brand: true, model: true, color: true } },
      },
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Validation error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: "Failed to create customer", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
