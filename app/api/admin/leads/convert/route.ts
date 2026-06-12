import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/middleware";
import { logEvent } from "@/lib/events";

/**
 * Convert a BusinessLead into a real account (admin-only).
 *
 *   TECHNICIAN        → User + TechnicianProfile (inactive — appears in the
 *                       /admin/technicians queue; set areas, then activate)
 *   REPAIR_SHOP_OWNER → User + RepairShop (lead fields + placeholders)
 *   SUPPLIER          → User + Supplier   (lead fields + placeholders)
 *
 * The account gets an unusable random password; the response carries a 24h
 * set-password link for the admin to send on WhatsApp.
 */
const schema = z.object({ leadId: z.string() });

function slugify(name: string, city: string | null): string {
  const base = `${name} ${city ?? ""}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${randomBytes(2).toString("hex")}`;
}

export async function POST(request: NextRequest) {
  const { auth, errorResponse } = await requireRole(request, "ADMIN");
  if (errorResponse) return errorResponse;

  try {
    const { leadId } = schema.parse(await request.json());
    const lead = await prisma.businessLead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json({ success: false, message: "Lead not found" }, { status: 404 });
    }

    const existing = await prisma.user.findUnique({ where: { email: lead.email }, select: { id: true } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `An account with ${lead.email} already exists` },
        { status: 409 },
      );
    }

    const password = await hash(randomBytes(24).toString("base64url"), 10);

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: lead.email,
          name: lead.name,
          phone: lead.phone,
          password,
          userType: lead.leadType as never, // REPAIR_SHOP_OWNER | TECHNICIAN | SUPPLIER (validated at lead creation)
        },
      });

      if (lead.leadType === "TECHNICIAN") {
        await tx.technicianProfile.create({
          data: {
            userId: u.id,
            publicSlug: slugify(lead.name, lead.city),
            whatsappNumber: lead.phone ?? "",
            categories: ["mobile"],   // default — edit before activating
            pincodes: [],             // REQUIRED before activation for dispatch matching
            isActive: false,
          },
        });
      } else if (lead.leadType === "REPAIR_SHOP_OWNER") {
        await tx.repairShop.create({
          data: {
            userId: u.id,
            name: `${lead.name}'s Shop`,
            phone: lead.phone ?? "",
            email: lead.email,
            street: "—",
            city: lead.city ?? "—",
            state: "—",
            zipCode: "—",
            country: "India",
          },
        });
      } else if (lead.leadType === "SUPPLIER") {
        await tx.supplier.create({
          data: {
            userId: u.id,
            companyName: lead.name,
            street: "—",
            city: lead.city ?? "—",
            state: "—",
            zipCode: "—",
          },
        });
      }

      await tx.businessLead.update({
        where: { id: leadId },
        data: { status: "ONBOARDED", notes: `${lead.notes ? lead.notes + "\n" : ""}Account created ${new Date().toLocaleDateString("en-IN")}` },
      });
      return u;
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, purpose: "password-reset", resetCounter: user.tokenVersion },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" },
    );
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in"}/reset-password?token=${token}`;

    await logEvent({
      type: "lead.converted",
      actorType: "ADMIN",
      actorId: auth.user!.userId,
      subjectType: "lead",
      subjectId: leadId,
      payload: { leadType: lead.leadType, userId: user.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        loginUrl,
        email: user.email,
        leadType: lead.leadType,
        next: lead.leadType === "TECHNICIAN"
          ? "Set service areas + categories in Technicians, then Activate"
          : "Send the link — they set a password and land on their dashboard",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    console.error("[leads:convert]", error);
    return NextResponse.json({ success: false, message: "Conversion failed" }, { status: 500 });
  }
}
