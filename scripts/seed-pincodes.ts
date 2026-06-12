/**
 * Seed the Pincode table from prisma/data/pincodes-in.csv (geonames dataset:
 * key,place_name,admin_name1,latitude,longitude,accuracy — ~11K rows).
 *
 * Idempotent: skipDuplicates on the pincode primary key.
 *
 * Usage:
 *   DATABASE_URL=... npx ts-node --project tsconfig.seed.json scripts/seed-pincodes.ts
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  const csv = readFileSync(join(__dirname, "..", "prisma", "data", "pincodes-in.csv"), "utf8");
  const lines = csv.split("\n").slice(1).filter(Boolean);

  const rows = lines.map((line) => {
    // Simple split is safe: this dataset has no quoted commas
    const [key, place, state, lat, lng] = line.split(",");
    const pincode = key?.replace("IN/", "").trim();
    if (!pincode || pincode.length !== 6) return null;
    return {
      pincode,
      office: place?.trim() || null,
      city: place?.trim() || "",
      district: place?.trim() || "",
      state: state?.trim() || "",
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
    };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  console.log(`Parsed ${rows.length} pincodes — inserting in batches…`);

  const BATCH = 1000;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const res = await prisma.pincode.createMany({
      data: rows.slice(i, i + BATCH),
      skipDuplicates: true,
    });
    inserted += res.count;
  }

  const total = await prisma.pincode.count();
  console.log(`✅ Inserted ${inserted} new rows. Pincode table now has ${total} rows.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
