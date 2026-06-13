import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CityTechnicianPage from "@/components/seo/CityTechnicianPage";
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
    title: `Become a Mobile Repair Technician in ${city.name} — Earn ₹25k–₹60k/month | LocalTech`,
    description: `Join LocalTech as a verified mobile repair technician in ${city.name}. Doorstep jobs routed to you. Earn ₹25,000–₹60,000/month. Free CRM. Apply in 5 minutes.`,
    alternates: { canonical: `https://localtech.in/become-a-technician-${slug}` },
    openGraph: {
      title: `Mobile Repair Technician Jobs in ${city.name} | LocalTech`,
      description: `Join LocalTech in ${city.name}. Earn ₹25k–₹60k/month. Jobs routed to you. Apply free.`,
      url: `https://localtech.in/become-a-technician-${slug}`,
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
  return <CityTechnicianPage city={city} />;
}
