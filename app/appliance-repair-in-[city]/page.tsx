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
    title: `Home Appliance Repair in ${city.name} — Fridge, AC, Washing Machine | LocalTech`,
    description: `Certified appliance repair in ${city.name}. Refrigerator, AC, washing machine, geyser. ${city.techCount}+ verified technicians. 30-day warranty. Response in ${city.responseMinutes} min.`,
    alternates: { canonical: `https://localtech.in/appliance-repair-in-${slug}` },
    openGraph: {
      title: `Appliance Repair in ${city.name} | LocalTech`,
      description: `Verified appliance technicians in ${city.name}. Fridge, AC, washing machine. 30-day warranty.`,
      url: `https://localtech.in/appliance-repair-in-${slug}`,
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
  return <CityRepairPage city={city} service="appliance" />;
}
