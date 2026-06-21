import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCityBySlug } from "@/lib/seo/cities";
import { getBrandBySlug, AP_TS_CITY_SLUGS } from "@/lib/seo/brands";
import { SERVICES } from "@/lib/seo/repair-content";
import type { ServiceType } from "@/lib/seo/repair-content";
import BrandCityRepairPage from "@/components/seo/BrandCityRepairPage";

export const revalidate = 86400;
export const dynamicParams = true;

// Parse slug of form: {brand}-{service}-repair-in-{city}
// e.g. "samsung-tv-repair-in-hyderabad"
// e.g. "ao-smith-water-purifier-repair-in-vijayawada"
function parseSlug(slug: string): { brandSlug: string; service: ServiceType; citySlug: string } | null {
  const marker = "-repair-in-";
  const markerIdx = slug.lastIndexOf(marker);
  if (markerIdx === -1) return null;

  const citySlug = slug.slice(markerIdx + marker.length);
  const brandAndService = slug.slice(0, markerIdx);

  // Service types ordered longest-first to avoid prefix-match bugs
  const serviceTypes: ServiceType[] = [
    "washing-machine",
    "water-purifier",
    "refrigerator",
    "microwave",
    "appliance",
    "laptop",
    "mobile",
    "geyser",
    "mixer",
    "cctv",
    "fan",
    "ac",
    "tv",
  ];

  for (const svc of serviceTypes) {
    const suffix = `-${svc}`;
    if (brandAndService.endsWith(suffix)) {
      const brandSlug = brandAndService.slice(0, brandAndService.length - suffix.length);
      return { brandSlug, service: svc, citySlug };
    }
  }

  return null;
}

export async function generateStaticParams() {
  const { BRANDS } = await import("@/lib/seo/brands");
  const params: { slug: string }[] = [];

  for (const citySlug of AP_TS_CITY_SLUGS) {
    for (const brand of BRANDS) {
      for (const service of brand.services) {
        params.push({ slug: `${brand.slug}-${service}-repair-in-${citySlug}` });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return { title: "LocalTech — Device Repair" };

  const city = getCityBySlug(parsed.citySlug);
  const brand = getBrandBySlug(parsed.brandSlug);
  const svc = SERVICES[parsed.service];
  if (!city || !brand || !svc) return { title: "LocalTech — Device Repair" };

  const title = `${brand.name} ${svc.shortLabel} in ${city.name} — Doorstep Service | LocalTech`;
  const description = `Certified ${brand.name} ${svc.shortLabel.toLowerCase()} in ${city.name}. ${city.techCount}+ verified technicians, 30-day warranty, response in ${city.responseMinutes} min. Fixed pricing. Book now.`;

  return {
    title,
    description,
    alternates: { canonical: `https://localtech.in/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://localtech.in/${slug}`,
      siteName: "LocalTech",
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function BrandCityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  const city = getCityBySlug(parsed.citySlug);
  const brand = getBrandBySlug(parsed.brandSlug);
  const svc = SERVICES[parsed.service];
  if (!city || !brand || !svc) notFound();

  return <BrandCityRepairPage brand={brand} city={city} service={parsed.service} />;
}
