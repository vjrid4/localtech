"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

const APPLIANCE_TYPES = [
  { icon: "❄️", title: "Refrigerator Repair", desc: "Not cooling, compressor, gas refill, defrost, door seal. All brands.", price: "₹499–₹5,000", slug: "refrigerator" },
  { icon: "👕", title: "Washing Machine Repair", desc: "Not draining, drum noise, PCB, pump, door seal. Semi & fully automatic.", price: "₹399–₹4,000", slug: "washing-machine" },
  { icon: "❄️", title: "AC Repair & Service", desc: "Not cooling, gas refill, PCB, deep cleaning, compressor check.", price: "₹499–₹6,000", slug: "ac" },
  { icon: "🌀", title: "Mixer Grinder Repair", desc: "Motor fault, jar leaking, coupler broken, switch repair.", price: "₹199–₹1,500", slug: "mixer" },
  { icon: "💨", title: "Ceiling Fan Repair", desc: "Slow fan, noise, capacitor, BLDC remote, bearing replacement.", price: "₹199–₹1,200", slug: "fan" },
  { icon: "🚿", title: "Geyser / Water Heater", desc: "Not heating, leaking, thermostat, element, anode rod repair.", price: "₹249–₹2,500", slug: "geyser" },
  { icon: "💧", title: "RO / Water Purifier", desc: "Low output, bad taste, leaking, pump, filter & membrane change.", price: "₹299–₹3,500", slug: "water-purifier" },
  { icon: "📦", title: "Microwave Oven Repair", desc: "Not heating, magnetron, door latch, turntable, display fault.", price: "₹349–₹3,000", slug: "microwave" },
];

const BRANDS = [
  "Samsung", "LG", "Whirlpool", "IFB", "Bosch", "Haier", "Godrej",
  "Daikin", "Voltas", "Blue Star", "Carrier", "Hitachi",
  "Preethi", "Butterfly", "Bajaj", "Prestige", "Philips", "Sujata",
  "Atomberg", "Orient", "Havells", "Crompton", "Usha",
  "Racold", "AO Smith", "V-Guard", "Kent", "Eureka Forbes", "Pureit", "Livpure",
];

const CITIES = [
  { slug: "hyderabad", name: "Hyderabad" }, { slug: "visakhapatnam", name: "Visakhapatnam" },
  { slug: "vijayawada", name: "Vijayawada" }, { slug: "guntur", name: "Guntur" },
  { slug: "warangal", name: "Warangal" }, { slug: "bangalore", name: "Bangalore" },
  { slug: "chennai", name: "Chennai" }, { slug: "mumbai", name: "Mumbai" },
  { slug: "delhi", name: "Delhi" }, { slug: "pune", name: "Pune" },
  { slug: "kurnool", name: "Kurnool" }, { slug: "nizamabad", name: "Nizamabad" },
];

export default function AppliancesPage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <LocalTechNav />

      <section style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#064e3b 100%)" }} className="pt-24 pb-20 px-4 text-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-4 py-1.5 text-green-300 text-sm font-medium mb-6">
              🏠 Home Appliance Repair — All Brands
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Appliance Repair at Your Home</h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-gray-300 text-lg max-w-2xl mb-8 leading-relaxed">
              Refrigerator, AC, washing machine, mixer grinder, fan, geyser, RO, microwave — LocalTech covers all home appliances. Certified technicians come to you with parts, tools, and a 30-day warranty.
            </p>
          </Reveal>
          <Reveal delay={300} className="flex flex-col sm:flex-row gap-4">
            <Link href="/book" className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-lg transition">Book Appliance Repair →</Link>
            <a href="tel:+918008001234" className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-xl text-lg transition">Call Now</a>
          </Reveal>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Appliances we repair</h2></Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {APPLIANCE_TYPES.map((a, i) => (
              <Reveal key={a.title} delay={i * 60}>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-full flex flex-col">
                  <div className="text-3xl mb-3">{a.icon}</div>
                  <div className="font-bold text-gray-900 mb-1">{a.title}</div>
                  <div className="text-gray-500 text-sm flex-1 mb-3">{a.desc}</div>
                  <div className="text-green-600 font-semibold text-sm">{a.price}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">All appliance brands covered</h2></Reveal>
          <div className="flex flex-wrap gap-2 justify-center">
            {BRANDS.map((b) => (
              <span key={b} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 text-sm font-medium">{b}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why LocalTech for appliance repair?</h2></Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: "✅", title: "Verified Technicians", desc: "Every technician is Aadhaar-verified, background-checked, and skills-tested." },
              { icon: "📋", title: "Written Estimate First", desc: "You see the price before we touch your appliance. No surprises." },
              { icon: "🛡️", title: "30-Day Warranty", desc: "Parts and labour warranty on every repair, in writing." },
              { icon: "🏠", title: "No Transport Needed", desc: "We come to you — no carrying heavy appliances to a service centre." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex gap-4">
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

      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Appliance repair in your city</h2></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CITIES.map((c) => (
              <Link key={c.slug} href={`/appliance-repair-in-${c.slug}`} className="block bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 hover:text-green-700 transition text-center">
                Appliances in {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-green-600 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Book Appliance Repair Now</h2>
          <p className="text-green-100 mb-8">Same-day service · Written quote · 30-day warranty</p>
          <Link href="/book" className="inline-block px-10 py-4 bg-white text-green-700 font-bold rounded-xl text-lg hover:bg-green-50 transition">Book Now →</Link>
        </div>
      </section>
    </div>
  );
}
