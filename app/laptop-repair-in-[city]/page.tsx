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
    title: `Laptop Repair in ${city.name} — Doorstep Screen, Battery & More | LocalTech`,
    description: `Certified laptop repair in ${city.name}. Screen, battery, keyboard, overheating, SSD upgrades. ${city.techCount}+ verified technicians. 30-day warranty. Response in ${city.responseMinutes} min.`,
    alternates: { canonical: `https://localtech.in/laptop-repair-in-${slug}` },
    openGraph: {
      title: `Laptop Repair in ${city.name} | LocalTech`,
      description: `Verified laptop technicians in ${city.name}. All brands. 30-day warranty. Book now.`,
      url: `https://localtech.in/laptop-repair-in-${slug}`,
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
  return <CityRepairPage city={city} service="laptop" />;
}
