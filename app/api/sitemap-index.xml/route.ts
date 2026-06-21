import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

const BASE = "https://localtech.in";

// Child sitemaps served from /api/sitemaps/[name]
const CHILD_SITEMAPS = [
  "main",
  "cities-telangana",
  "cities-andhra-pradesh",
  "cities-rest",
  "brands-ap-ts",
];

export function GET() {
  const lastmod = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${CHILD_SITEMAPS.map(
  (name) => `  <sitemap>
    <loc>${BASE}/api/sitemaps/${name}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
).join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
