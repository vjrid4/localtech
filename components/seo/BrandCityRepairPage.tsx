import Link from "next/link";
import type { CityData } from "@/lib/seo/cities";
import type { ServiceType } from "@/lib/seo/repair-content";
import type { Brand } from "@/lib/seo/brands";
import { SERVICES, getIntroVariant, getFAQs } from "@/lib/seo/repair-content";
import LocalTechNav from "@/components/LocalTechNav";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildJsonLd(brand: Brand, city: CityData, service: ServiceType, faqs: Array<{ q: string; a: string }>) {
  const svc = SERVICES[service];
  const base = "https://localtech.in";
  const slug = `${brand.slug}-${service}-repair-in-${city.slug}`;
  const url = `${base}/${slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: base },
          { "@type": "ListItem", position: 2, name: `${svc.shortLabel}`, item: `${base}/${service === "mobile" ? "mobiles" : service === "tv" ? "tv" : service === "laptop" ? "laptops" : "appliances"}` },
          { "@type": "ListItem", position: 3, name: `${brand.name} ${svc.shortLabel} in ${city.name}`, item: url },
        ],
      },
      {
        "@type": "LocalBusiness",
        name: `LocalTech ${brand.name} ${svc.shortLabel} – ${city.name}`,
        description: `Certified ${brand.name} ${svc.shortLabel.toLowerCase()} in ${city.name}. ${city.techCount}+ verified technicians. 30-day warranty. Response in ${city.responseMinutes} min.`,
        url,
        priceRange: svc.priceRange,
        areaServed: { "@type": "City", name: city.name },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: city.avgRating.toFixed(1),
          reviewCount: city.reviewCount.toString(),
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: city.name,
          addressRegion: city.state,
          addressCountry: "IN",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: esc(f.q),
          acceptedAnswer: { "@type": "Answer", text: esc(f.a) },
        })),
      },
    ],
  };
}

interface Props {
  brand: Brand;
  city: CityData;
  service: ServiceType;
}

const SERVICE_URL_PREFIX: Partial<Record<ServiceType, string>> = {
  mobile: "mobiles",
  tv: "tv",
  laptop: "laptops",
  appliance: "appliances",
  cctv: "cctv",
};

export default function BrandCityRepairPage({ brand, city, service }: Props) {
  const svc = SERVICES[service];
  const introText = getIntroVariant(`${brand.slug}-${city.slug}`, city.name, service);
  const faqs = getFAQs(city.slug, city, service);
  const brandFaqs = [
    {
      q: `Is my ${brand.name} ${svc.deviceLabel} covered by LocalTech in ${city.name}?`,
      a: `Yes. LocalTech technicians in ${city.name} are trained to service ${brand.name} ${svc.deviceLabel}s, including models like ${(brand.models ?? []).slice(0, 3).join(", ")}. They carry commonly required parts and can complete most repairs in a single visit at your location.`,
    },
    {
      q: `Does LocalTech use genuine ${brand.name} parts?`,
      a: `LocalTech uses OEM-grade or original parts for ${brand.name} repairs. The technician will confirm the part grade and price before starting work. For devices still under manufacturer warranty, we recommend checking if an authorised ${brand.name} service centre is available — LocalTech is ideal for out-of-warranty repairs.`,
    },
    ...faqs.slice(0, 3),
  ];
  const jsonLd = buildJsonLd(brand, city, service, brandFaqs);

  const categoryUrl = SERVICE_URL_PREFIX[service] ? `/${SERVICE_URL_PREFIX[service]}` : "/appliances";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LocalTechNav />

      {/* Hero */}
      <section
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#064e3b 60%,#0f172a 100%)" }}
        className="pt-24 pb-16 px-4"
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-4 py-1.5 text-green-300 text-sm font-medium mb-6">
            {svc.emoji} {brand.name} Authorised Repair — {city.name}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {brand.name} {svc.label} in {city.name}
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">{introText}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-lg transition"
            >
              Book Doorstep Repair →
            </Link>
            <a
              href="tel:+918008001234"
              className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-xl text-lg transition"
            >
              Call Now
            </a>
          </div>
          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { label: "Technicians", value: `${city.techCount}+` },
              { label: "Avg Rating", value: `${city.avgRating} ★` },
              { label: "Response", value: `${city.responseMinutes} min` },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-green-400">{s.value}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Issues covered */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {brand.name} {svc.deviceLabel} problems we fix in {city.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {svc.issues.map((issue) => (
              <div key={issue.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
                <span className="text-2xl">{issue.emoji}</span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{issue.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{issue.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular models */}
      {brand.models && brand.models.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Popular {brand.name} models we repair
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {brand.models.map((model) => (
                <span key={model} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 text-sm font-medium">
                  {model}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why LocalTech */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Why choose LocalTech for {brand.name} repair in {city.name}?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "✅", title: "KYC-Verified Technicians", desc: "Every technician is Aadhaar-verified, background-checked, and skills-tested before joining." },
              { icon: "📋", title: "Written Estimate First", desc: "You get a detailed quote before any part is touched. No hidden charges, no surprises." },
              { icon: "🛡️", title: "30-Day Warranty", desc: "All repairs come with a written 30-day parts and labour warranty on the repaired component." },
              { icon: "🏠", title: "100% Doorstep Service", desc: `Our technicians come to your home or office anywhere in ${city.name}. Average arrival in ${city.responseMinutes} minutes.` },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-bold text-gray-900">{item.title}</div>
                  <div className="text-gray-600 text-sm mt-1">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            FAQs — {brand.name} {svc.shortLabel} in {city.name}
          </h2>
          <div className="space-y-4">
            {brandFaqs.map((faq) => (
              <details key={faq.q} className="border border-gray-200 rounded-xl">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-green-600 list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-green-500 text-lg ml-2">+</span>
                </summary>
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-green-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Book {brand.name} {svc.shortLabel} in {city.name}
          </h2>
          <p className="text-green-100 mb-8">
            {city.techCount}+ verified technicians · {city.avgRating} ★ rating · 30-day warranty
          </p>
          <Link href="/book" className="inline-block px-10 py-4 bg-white text-green-700 font-bold rounded-xl text-lg hover:bg-green-50 transition">
            Book Now — Free Diagnosis
          </Link>
        </div>
      </section>

      {/* Back links */}
      <section className="py-8 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center text-sm">
          <Link href="/" className="text-green-600 hover:underline">Home</Link>
          <span className="text-gray-400">·</span>
          <Link href={categoryUrl} className="text-green-600 hover:underline">{svc.shortLabel}</Link>
          <span className="text-gray-400">·</span>
          <Link href={`/${service}-repair-in-${city.slug}`} className="text-green-600 hover:underline">
            All {svc.shortLabel} in {city.name}
          </Link>
          <span className="text-gray-400">·</span>
          <Link href="/book" className="text-green-600 hover:underline">Book Repair</Link>
        </div>
      </section>
    </>
  );
}
