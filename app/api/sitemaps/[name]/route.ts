import { NextRequest, NextResponse } from "next/server";
import { CITIES } from "@/lib/seo/cities";
import { BRANDS, AP_TS_CITY_SLUGS } from "@/lib/seo/brands";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

const BASE = "https://localtech.in";
const lastmod = new Date().toISOString().split("T")[0];

function url(loc: string, priority = "0.7", changefreq = "weekly") {
  return `  <url>\n    <loc>${BASE}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function buildXml(urls: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const services = ["mobile", "tv", "laptop", "appliance"];

  let xml: string;

  if (name === "main") {
    const staticPages = [
      url("/", "1.0", "daily"),
      url("/book", "0.9", "weekly"),
      url("/join", "0.8", "weekly"),
      url("/mobiles", "0.9", "weekly"),
      url("/tv", "0.9", "weekly"),
      url("/laptops", "0.9", "weekly"),
      url("/appliances", "0.9", "weekly"),
      url("/cctv", "0.8", "weekly"),
      url("/solar", "0.8", "weekly"),
      url("/repair/telangana", "0.8", "weekly"),
      url("/repair/andhra-pradesh", "0.8", "weekly"),
      url("/login", "0.5", "monthly"),
      url("/register", "0.5", "monthly"),
    ];
    xml = buildXml(staticPages);

  } else if (name === "cities-telangana") {
    const tsCities = CITIES.filter((c) => c.state === "Telangana");
    const urls: string[] = [];
    for (const city of tsCities) {
      for (const svc of services) {
        urls.push(url(`/${svc}-repair-in-${city.slug}`, "0.8", "weekly"));
      }
    }
    xml = buildXml(urls);

  } else if (name === "cities-andhra-pradesh") {
    const apCities = CITIES.filter((c) => c.state === "Andhra Pradesh");
    const urls: string[] = [];
    for (const city of apCities) {
      for (const svc of services) {
        urls.push(url(`/${svc}-repair-in-${city.slug}`, "0.8", "weekly"));
      }
    }
    xml = buildXml(urls);

  } else if (name === "cities-rest") {
    const otherCities = CITIES.filter((c) => c.state !== "Telangana" && c.state !== "Andhra Pradesh");
    const urls: string[] = [];
    for (const city of otherCities) {
      for (const svc of services) {
        urls.push(url(`/${svc}-repair-in-${city.slug}`, "0.7", "weekly"));
      }
    }
    xml = buildXml(urls);

  } else if (name === "brands-ap-ts") {
    const urls: string[] = [];
    for (const citySlug of AP_TS_CITY_SLUGS) {
      for (const brand of BRANDS) {
        for (const svc of brand.services) {
          urls.push(url(`/${brand.slug}-${svc}-repair-in-${citySlug}`, "0.6", "monthly"));
        }
      }
    }
    xml = buildXml(urls);

  } else {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
