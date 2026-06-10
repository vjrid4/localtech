import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createToken } from "@/lib/auth/jwt";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  userType: z.enum(["REPAIR_SHOP_OWNER", "TECHNICIAN", "CUSTOMER", "SUPPLIER"]),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, userType, phone } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    // SECURITY: Force CUSTOMER role for public registration. Elevated roles require admin flow.
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        userType: "CUSTOMER",
        phone,
      },
    });

    const token = createToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
      tokenVersion: user.tokenVersion,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
