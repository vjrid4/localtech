import Link from "next/link";
import type { CityData } from "@/lib/seo/cities";
import type { ServiceType } from "@/lib/seo/repair-content";
import {
  SERVICES,
  getPricing,
  getIntroVariant,
  getTestimonials,
  getFAQs,
  getNearbyLinks,
} from "@/lib/seo/repair-content";
import LocalTechNav from "@/components/LocalTechNav";

// Helper to produce JSON-LD
function buildJsonLd(city: CityData, service: ServiceType, faqs: Array<{ q: string; a: string }>) {
  const svc = SERVICES[service];
  const base = "https://localtech.in";
  const serviceSlug = service === "mobile" ? "mobile" : service === "tv" ? "tv" : service === "laptop" ? "laptop" : "appliance";
  const url = `${base}/${serviceSlug}-repair-in-${city.slug}`;
  const breadcrumbSecond = service === "mobile" ? "Mobile Repair" : service === "tv" ? "TV Repair" : service === "laptop" ? "Laptop Repair" : "Appliance Repair";
  const breadcrumbSecondUrl = service === "mobile" ? `${base}/mobiles` : service === "tv" ? `${base}/tv` : service === "laptop" ? `${base}/laptops` : `${base}/appliances`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: base },
          { "@type": "ListItem", position: 2, name: breadcrumbSecond, item: breadcrumbSecondUrl },
          { "@type": "ListItem", position: 3, name: `${svc.shortLabel} in ${city.name}` },
        ],
      },
      {
        "@type": "LocalBusiness",
        name: `LocalTech ${svc.shortLabel} – ${city.name}`,
        description: `Certified ${svc.shortLabel.toLowerCase()} in ${city.name}. ${city.techCount}+ verified technicians. 30-day warranty. Response in ${city.responseMinutes} min.`,
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
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

interface Props {
  city: CityData;
  service: ServiceType;
}

export default function CityRepairPage({ city, service }: Props) {
  const svc = SERVICES[service];
  const pricing = getPricing(city.priceIndex);
  const introText = getIntroVariant(city.slug, city.name, service);
  const testimonials = getTestimonials(city.slug, city);
  const faqs = getFAQs(city.slug, city, service);
  const nearbyLinks = getNearbyLinks(city.slug);
  const jsonLd = buildJsonLd(city, service, faqs);

  const tierBadge = city.tier === "metro" ? "Metro City Service" : city.tier === "tier1" ? "Major City Service" : null;
  const heroGradient =
    city.tier === "metro"
      ? "linear-gradient(135deg, #0f172a 0%, #064e3b 60%, #0f172a 100%)"
      : city.tier === "tier1"
      ? "linear-gradient(135deg, #0f172a 0%, #065f46 60%, #134e4a 100%)"
      : "linear-gradient(135deg, #1e293b 0%, #166534 60%, #1e293b 100%)";

  const serviceSlug = `${service}-repair-in-${city.slug}`;

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LocalTechNav />

      {/* ── Hero ── */}
      <section
        style={{ background: heroGradient }}
        className="pt-24 pb-16 px-4 text-white"
      >
        <div className="max-w-7xl mx-auto">
          {tierBadge && (
            <span className="inline-block mb-4 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-green-400 text-sm font-medium">
              {tierBadge}
            </span>
          )}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {svc.shortLabel} in {city.name}
          </h1>

          {/* Trust bar */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-300">
            <span>✅ {city.techCount}+ verified technicians</span>
            <span>⭐ {city.avgRating} rating ({city.reviewCount}+ reviews)</span>
            <span>🛡️ 30-day warranty</span>
            <span>⚡ {city.responseMinutes} min response</span>
          </div>

          <p className="text-lg text-gray-300 max-w-2xl mb-8 leading-relaxed">
            {city.localIntro}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/book"
              className="inline-block bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Book Repair
            </Link>
            <Link
              href="/track"
              className="inline-block bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Track Repair
            </Link>
          </div>
        </div>
      </section>

      {/* ── Common Issues ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Common {svc.shortLabel} Issues in {city.name}
          </h2>
          <p className="text-gray-500 mb-8">{introText}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {svc.issues.map((issue) => (
              <div
                key={issue.name}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center hover:border-green-200 hover:shadow-sm transition-all"
              >
                <div className="text-3xl mb-2">{issue.emoji}</div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{issue.name}</div>
                <div className="text-xs text-gray-500">{issue.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Table ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            What does {svc.shortLabel.toLowerCase()} cost in {city.name}?
          </h2>
          <p className="text-gray-500 mb-8">
            Prices are estimates based on recent repairs in {city.name}. Your technician will confirm the exact quote before starting work — no surprises.
          </p>

          {service === "mobile" && (
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="text-left px-6 py-4 font-semibold">Brand / Model</th>
                    <th className="text-left px-6 py-4 font-semibold">Screen</th>
                    <th className="text-left px-6 py-4 font-semibold">Battery</th>
                    <th className="text-left px-6 py-4 font-semibold">Port</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pricing.map((row) => (
                    <tr key={row.brand} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{row.brand}</td>
                      <td className="px-6 py-4 text-gray-700">{row.screen}</td>
                      <td className="px-6 py-4 text-gray-700">{row.battery}</td>
                      <td className="px-6 py-4 text-gray-700">{row.port}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {service !== "mobile" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {svc.issues.map((issue) => (
                <div key={issue.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="text-2xl mb-2">{issue.emoji}</div>
                  <div className="font-semibold text-gray-900 mb-1">{issue.name}</div>
                  <div className="text-sm text-gray-500">Typical time: {issue.time}</div>
                  <div className="mt-2 text-sm font-medium text-green-700">
                    Quote given before work starts
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4 italic">
            * Prices shown are estimates. Final quote given before any work starts. No hidden costs.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            How does LocalTech work in {city.name}?
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                n: "1",
                title: "Book in 2 minutes",
                desc: `Describe your issue and location in ${city.name}. No account needed. You'll get a booking reference immediately.`,
              },
              {
                n: "2",
                title: `Certified tech calls within ${city.responseMinutes} min`,
                desc: "A background-verified LocalTech technician confirms your address and brings the right parts for your device model.",
              },
              {
                n: "3",
                title: "Repair done, warranty card issued",
                desc: "The technician fixes your device at your location and hands you a 30-day warranty card before leaving.",
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 text-white font-bold text-xl flex items-center justify-center">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Areas Covered ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Which areas of {city.name} do you cover?
          </h2>
          <p className="text-gray-500 mb-6">
            We cover all of {city.name}. Technicians are stationed across the city for fast response.
          </p>
          <div className="flex flex-wrap gap-3">
            {city.areas.map((area) => (
              <span
                key={area}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why LocalTech ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Why LocalTech for {svc.shortLabel} in {city.name}?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🛡️",
                title: "Background-verified technicians",
                desc: `Every LocalTech technician in ${city.name} has passed ID verification, a skills assessment, and a field test before being activated on the platform.`,
              },
              {
                icon: "🔩",
                title: "OEM and Grade-A parts",
                desc: "We use manufacturer-sourced or Grade-A OEM parts. The part grade is disclosed to you before work starts — no bait-and-switch to low-quality replacements.",
              },
              {
                icon: "📍",
                title: "Live tracking link",
                desc: "Once your technician is dispatched, you get a live tracking link via SMS so you know exactly when they'll arrive — no waiting and wondering.",
              },
              {
                icon: "📋",
                title: "30-day warranty, free redo",
                desc: "Every repair carries a 30-day parts and labour warranty. If the same fault recurs, we send the technician back at zero cost — no questions asked.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:border-green-200 transition-colors">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            What customers in {city.name} say
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                <div className="text-gray-500 text-xs">{t.device}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Frequently asked questions about {svc.shortLabel.toLowerCase()} in {city.name}
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group border border-gray-200 rounded-2xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition-colors list-none">
                  <span>{faq.q}</span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-gray-600 leading-relaxed text-sm">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Internal Links ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Also repair in nearby cities</h2>
          <div className="flex flex-wrap gap-3 mb-8">
            {nearbyLinks.map((nc) => (
              <Link
                key={nc.slug}
                href={`/${service}-repair-in-${nc.slug}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 text-sm hover:border-green-400 hover:text-green-700 transition-colors"
              >
                {svc.shortLabel} in {nc.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {(["mobile", "tv", "laptop", "appliance"] as ServiceType[])
              .filter((s) => s !== service)
              .map((s) => (
                <Link
                  key={s}
                  href={`/${s}-repair-in-${city.slug}`}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 text-sm hover:border-green-400 hover:text-green-700 transition-colors"
                >
                  {SERVICES[s].shortLabel} in {city.name}
                </Link>
              ))}
          </div>
          <p className="text-gray-400 text-sm mt-8">
            LocalTech is India&rsquo;s verified repair marketplace — shop owners, technicians, and customers all in one place.
          </p>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-16 px-4 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to fix your {svc.deviceLabel} in {city.name}?
          </h2>
          <p className="text-gray-300 mb-8">
            Book now and a verified technician calls you back within {city.responseMinutes} minutes.
          </p>
          <Link
            href="/book"
            className="inline-block bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors"
          >
            Book Repair Now
          </Link>
        </div>
      </section>
    </>
  );
}
