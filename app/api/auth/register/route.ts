import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

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

    // TODO: Create user in database
    // const hashedPassword = await hash(password, 10);
    // const user = await prisma.user.create({...})

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: {
          email,
          name,
          userType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
