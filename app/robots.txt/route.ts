export const dynamic = "force-dynamic";

export function GET() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://localtech.in";
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /dashboard/\nDisallow: /api/\nAllow: /api/sitemap.xml\n\nSitemap: ${base}/api/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
