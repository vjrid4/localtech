import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CityRepairPage from "@/components/seo/CityRepairPage";
import { getCityBySlug, CITIES } from "@/lib/seo/cities";

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return {};
  return {
    title: `TV Repair in ${city.name} — Doorstep LED, LCD & Smart TV | LocalTech`,
    description: `Certified TV repair in ${city.name}. Screen lines, no power, HDMI, smart TV issues. ${city.techCount}+ verified technicians. 30-day warranty. Response in ${city.responseMinutes} min.`,
    alternates: { canonical: `https://localtech.in/tv-repair-in-${slug}` },
    openGraph: {
      title: `TV Repair in ${city.name} | LocalTech`,
      description: `Verified TV technicians in ${city.name}. All brands. 30-day warranty. Book now.`,
      url: `https://localtech.in/tv-repair-in-${slug}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();
  return <CityRepairPage city={city} service="tv" />;
}
