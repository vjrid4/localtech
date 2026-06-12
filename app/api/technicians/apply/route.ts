import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { logEvent } from "@/lib/events";

/**
 * Public technician application (90-day plan T7).
 * Creates User (TECHNICIAN role) + TechnicianProfile with isActive=false —
 * nothing goes live until admin approval + KYC. No password is chosen here;
 * a random one is set and the technician uses the reset-password flow (or
 * later, phone OTP) to claim the account after approval.
 */
const applySchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile required"),
  whatsappNumber: z.string().regex(/^[6-9]\d{9}$/).optional(),
  email: z.string().email().optional(),
  categories: z.array(z.enum(["mobile", "tv", "laptop", "appliance", "cctv", "solar"])).min(1),
  pincodes: z.array(z.string().regex(/^\d{6}$/)).min(1).max(20),
  yearsExperience: z.number().int().min(0).max(50),
  city: z.string().min(2).max(60),
});

function slugify(name: string, city: string): string {
  const base = `${name} ${city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${randomBytes(2).toString("hex")}`;
}

export async function POST(request: NextRequest) {
  try {
    const data = applySchema.parse(await request.json());

    // Phone is the identity for technicians — block duplicate applications
    const existing = await prisma.user.findFirst({
      where: { phone: data.phone, userType: "TECHNICIAN" },
      select: { id: true, technicianProfile: { select: { id: true } } },
    });
    if (existing?.technicianProfile) {
      return NextResponse.json(
        { success: false, message: "An application with this phone number already exists. We'll contact you soon." },
        { status: 409 },
      );
    }

    const email = data.email ?? `tech-${data.phone}@apply.localtech.in`;
    const emailTaken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (emailTaken) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists. Try signing in instead." },
        { status: 409 },
      );
    }

    const randomPassword = await hash(randomBytes(24).toString("base64url"), 10);

    const profile = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          phone: data.phone,
          name: data.name,
          password: randomPassword, // unusable until reset — account claimed after approval
          userType: "TECHNICIAN",
        },
      });
      return tx.technicianProfile.create({
        data: {
          userId: user.id,
          publicSlug: slugify(data.name, data.city),
          whatsappNumber: data.whatsappNumber ?? data.phone,
          categories: data.categories,
          pincodes: data.pincodes,
          homePincode: data.pincodes[0],
          yearsExperience: data.yearsExperience,
          isActive: false,
        },
      });
    });

    await logEvent({
      type: "technician.applied",
      actorType: "TECHNICIAN",
      actorId: profile.userId,
      subjectType: "technician",
      subjectId: profile.id,
      payload: { categories: data.categories, pincodes: data.pincodes, city: data.city, yearsExperience: data.yearsExperience },
    });

    return NextResponse.json({ success: true, data: { id: profile.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message ?? "Validation error" },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: false, message: "Application failed. Please try again." }, { status: 500 });
  }
}
