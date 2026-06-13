export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in";
  const now = new Date().toISOString();

  const staticUrls: Array<{ loc: string; priority: string; changefreq?: string }> = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/book", priority: "0.9", changefreq: "monthly" },
    { loc: "/mobiles", priority: "0.9", changefreq: "monthly" },
    { loc: "/tv", priority: "0.8", changefreq: "monthly" },
    { loc: "/laptops", priority: "0.8", changefreq: "monthly" },
    { loc: "/appliances", priority: "0.8", changefreq: "monthly" },
    { loc: "/cctv", priority: "0.7", changefreq: "monthly" },
    { loc: "/solar", priority: "0.7", changefreq: "monthly" },
    { loc: "/technician/apply", priority: "0.7", changefreq: "monthly" },
  ];

  const { CITIES } = await import("@/lib/seo/cities");
  const services = ["mobile", "tv", "laptop", "appliance"] as const;

  const serviceUrls: Array<{ loc: string; priority: string; changefreq?: string }> = CITIES.flatMap(
    (city) => [
      ...services.map((s) => ({
        loc: `/${s}-repair-in-${city.slug}`,
        priority: s === "mobile" ? "0.8" : "0.7",
        changefreq: "weekly",
      })),
      { loc: `/become-a-technician-${city.slug}`, priority: "0.7", changefreq: "monthly" },
      { loc: `/partner-with-localtech-${city.slug}`, priority: "0.6", changefreq: "monthly" },
    ]
  );

  const allUrls = [...staticUrls, ...serviceUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${base}${u.loc}</loc>
    <lastmod>${now.split("T")[0]}</lastmod>
    <changefreq>${u.changefreq ?? "monthly"}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
