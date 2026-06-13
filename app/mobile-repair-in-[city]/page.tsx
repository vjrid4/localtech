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
    title: `Mobile Phone Repair in ${city.name} — Doorstep & Same-Day | LocalTech`,
    description: `Certified mobile repair in ${city.name}. Screen, battery, charging port, water damage. ${city.techCount}+ verified technicians. 30-day warranty. Response in ${city.responseMinutes} min. Book now.`,
    alternates: { canonical: `https://localtech.in/mobile-repair-in-${slug}` },
    openGraph: {
      title: `Mobile Repair in ${city.name} | LocalTech`,
      description: `Verified technicians in ${city.name}. Screen from ₹799. 30-day warranty. Book now.`,
      url: `https://localtech.in/mobile-repair-in-${slug}`,
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
  return <CityRepairPage city={city} service="mobile" />;
}
