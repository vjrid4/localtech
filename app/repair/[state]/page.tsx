import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCitiesByState } from "@/lib/seo/cities";
import LocalTechNav from "@/components/LocalTechNav";

export const revalidate = 86400;

const STATE_MAP: Record<string, { name: string; capital: string; intro: string }> = {
  "andhra-pradesh": {
    name: "Andhra Pradesh",
    capital: "Amaravati",
    intro: "Andhra Pradesh's 13 districts — from the Godavari delta to the Rayalaseema highlands — are served by LocalTech's growing network of KYC-verified, skills-tested repair technicians. Whether you're in Visakhapatnam's steel township or a small town in Anantapur district, we bring certified doorstep repair to your location.",
  },
  telangana: {
    name: "Telangana",
    capital: "Hyderabad",
    intro: "Telangana spans from the high-tech corridors of HITEC City to the cotton fields of Karimnagar and the forests of Khammam. LocalTech's network of certified technicians covers every major town in the state — mobile repair, TV repair, laptop repair, and home appliance service — all doorstep with a 30-day warranty.",
  },
  karnataka: {
    name: "Karnataka",
    capital: "Bangalore",
    intro: "Karnataka's tech economy stretches from Bangalore's startup corridors to Mysuru's heritage districts and Hubli-Dharwad's commercial belt. LocalTech brings the same verified, doorstep repair standard across Karnataka.",
  },
};

export async function generateStaticParams() {
  return Object.keys(STATE_MAP).map((state) => ({ state }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const stateData = STATE_MAP[state];
  if (!stateData) return { title: "LocalTech" };

  const title = `Device Repair Services in ${stateData.name} — All Cities | LocalTech`;
  const description = `LocalTech covers ${stateData.name} with certified mobile, TV, laptop, and appliance repair technicians across all major cities and towns. Doorstep service, 30-day warranty.`;

  return {
    title,
    description,
    alternates: { canonical: `https://localtech.in/repair/${state}` },
    openGraph: { title, description, url: `https://localtech.in/repair/${state}`, siteName: "LocalTech" },
  };
}

export default async function StateRepairPage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const stateData = STATE_MAP[state];
  if (!stateData) notFound();

  const cities = getCitiesByState(stateData.name);
  const metroCities = cities.filter((c) => c.tier === "metro");
  const tier1Cities = cities.filter((c) => c.tier === "tier1");
  const tier2Cities = cities.filter((c) => c.tier === "tier2");

  const totalTechs = cities.reduce((a, c) => a + c.techCount, 0);
  const avgRating = (cities.reduce((a, c) => a + c.avgRating, 0) / cities.length).toFixed(1);

  const services = [
    { slug: "mobile", label: "Mobile Repair", emoji: "📱" },
    { slug: "tv", label: "TV Repair", emoji: "📺" },
    { slug: "laptop", label: "Laptop Repair", emoji: "💻" },
    { slug: "ac", label: "AC Repair", emoji: "❄️" },
    { slug: "refrigerator", label: "Refrigerator Repair", emoji: "🧊" },
    { slug: "washing-machine", label: "Washing Machine Repair", emoji: "👕" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: `Device Repair Services in ${stateData.name}`,
            provider: { "@type": "Organization", name: "LocalTech", url: "https://localtech.in" },
            areaServed: { "@type": "State", name: stateData.name },
            description: `LocalTech certified repair technicians across ${cities.length} cities in ${stateData.name}.`,
          }),
        }}
      />

      <LocalTechNav />

      {/* Hero */}
      <section
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#064e3b 60%,#0f172a 100%)" }}
        className="pt-24 pb-16 px-4 text-white text-center"
      >
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-4 py-1.5 text-green-300 text-sm font-medium mb-6">
            🗺️ {stateData.name} Coverage
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Device Repair Services in {stateData.name}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">{stateData.intro}</p>
          <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{cities.length}+</div>
              <div className="text-gray-400 text-sm">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{totalTechs}+</div>
              <div className="text-gray-400 text-sm">Technicians</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{avgRating} ★</div>
              <div className="text-gray-400 text-sm">Avg Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Services across {stateData.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug === "mobile" ? "mobiles" : s.slug === "tv" ? "tv" : s.slug === "laptop" ? "laptops" : "appliances"}`}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 transition flex items-center gap-3"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="font-semibold text-gray-900 text-sm">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      {metroCities.length > 0 && (
        <section className="py-10 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Metro Cities
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {metroCities.map((city) => (
                <Link key={city.slug} href={`/mobile-repair-in-${city.slug}`} className="flex items-center justify-between bg-gray-50 hover:bg-green-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition">
                  <div>
                    <div className="font-bold text-gray-900">{city.name}</div>
                    <div className="text-gray-500 text-sm">{city.techCount}+ techs · {city.avgRating} ★</div>
                  </div>
                  <span className="text-green-500 text-lg">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {tier1Cities.length > 0 && (
        <section className="py-10 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Major Cities
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tier1Cities.map((city) => (
                <Link key={city.slug} href={`/mobile-repair-in-${city.slug}`} className="flex items-center justify-between bg-white hover:bg-green-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition">
                  <div>
                    <div className="font-bold text-gray-900">{city.name}</div>
                    <div className="text-gray-500 text-sm">{city.techCount}+ techs · {city.avgRating} ★</div>
                  </div>
                  <span className="text-green-500 text-lg">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-5" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            All Towns in {stateData.name} ({tier2Cities.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tier2Cities.map((city) => (
              <Link
                key={city.slug}
                href={`/mobile-repair-in-${city.slug}`}
                className="block text-sm text-green-700 hover:text-green-900 hover:underline py-1"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-green-600 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Book Repair in {stateData.name}
          </h2>
          <p className="text-green-100 mb-6">Any city, any device — certified technician at your door</p>
          <Link href="/book" className="inline-block px-8 py-4 bg-white text-green-700 font-bold rounded-xl text-lg hover:bg-green-50 transition">
            Book Now
          </Link>
        </div>
      </section>
    </>
  );
}
