/**
 * Create (or reset password for) the admin user.
 *
 * Usage:
 *   DATABASE_URL=... ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=strongpass \
 *     npx ts-node --project tsconfig.seed.json scripts/create-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars.");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("ADMIN_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }

  const hashed = await hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, userType: "ADMIN", tokenVersion: { increment: 1 } },
    create: { email, password: hashed, name, userType: "ADMIN" },
  });

  console.log(`✅ Admin user ready: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
