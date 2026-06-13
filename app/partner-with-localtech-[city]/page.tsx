import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CityPartnerPage from "@/components/seo/CityPartnerPage";
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
    title: `Partner with LocalTech in ${city.name} — Free CRM for Repair Shops`,
    description: `Grow your ${city.name} repair shop with LocalTech's free CRM, platform customer referrals, and verified technician hiring. No upfront cost. Setup in 10 minutes.`,
    alternates: { canonical: `https://localtech.in/partner-with-localtech-${slug}` },
    openGraph: {
      title: `Repair Shop Partner Program — ${city.name} | LocalTech`,
      description: `Free CRM + platform customers for your ${city.name} repair shop. No subscription. Join free.`,
      url: `https://localtech.in/partner-with-localtech-${slug}`,
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
  return <CityPartnerPage city={city} />;
}
