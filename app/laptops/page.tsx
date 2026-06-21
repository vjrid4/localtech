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

const ISSUES = [
  { icon: "💔", title: "Screen Replacement", desc: "IPS, OLED, 4K panels for all brands and models" },
  { icon: "🔋", title: "Battery Replacement", desc: "Genuine or OEM batteries — same-day for most models" },
  { icon: "⌨️", title: "Keyboard / Trackpad", desc: "Key replacement, flex cable, trackpad click repair" },
  { icon: "🌡️", title: "Overheating / Fan", desc: "Thermal paste, fan cleaning, heat pipe replacement" },
  { icon: "💾", title: "HDD to SSD Upgrade", desc: "Speed up your laptop — data migration included" },
  { icon: "🔌", title: "Charging Port / DC Jack", desc: "Type-C, MagSafe, barrel connector repair" },
  { icon: "🖧", title: "Motherboard / RAM", desc: "Component-level soldering, RAM upgrade, GPU repair" },
  { icon: "📶", title: "Wi-Fi / Bluetooth", desc: "Network card, antenna replacement, driver repair" },
];

const BRANDS = [
  { name: "Dell", note: "Inspiron, XPS, Vostro, Latitude" },
  { name: "HP", note: "Pavilion, Envy, Victus, ProBook" },
  { name: "Lenovo", note: "IdeaPad, ThinkPad, Legion" },
  { name: "Asus", note: "VivoBook, ZenBook, ROG, ExpertBook" },
  { name: "Acer", note: "Aspire, Swift, Nitro, TravelMate" },
  { name: "Apple", note: "MacBook Air, MacBook Pro (M1–M3)" },
  { name: "MSI", note: "Thin, Modern, Creator, Raider" },
  { name: "Toshiba / Dynabook", note: "Satellite, Portégé" },
  { name: "Samsung", note: "Galaxy Book series" },
  { name: "All Others", note: "Any brand, any model" },
];

const PRICE_GUIDE = [
  { issue: "Screen Replacement (15.6\" FHD)", from: 2500, to: 6500 },
  { issue: "Battery Replacement", from: 900, to: 3200 },
  { issue: "Keyboard Replacement", from: 800, to: 2500 },
  { issue: "SSD Upgrade (512 GB)", from: 2800, to: 4500 },
  { issue: "Charging Port Repair", from: 600, to: 1800 },
  { issue: "RAM Upgrade (8 GB add)", from: 1500, to: 3000 },
];

const CITIES = [
  { slug: "hyderabad", name: "Hyderabad" }, { slug: "visakhapatnam", name: "Visakhapatnam" },
  { slug: "vijayawada", name: "Vijayawada" }, { slug: "guntur", name: "Guntur" },
  { slug: "warangal", name: "Warangal" }, { slug: "tirupati", name: "Tirupati" },
  { slug: "bangalore", name: "Bangalore" }, { slug: "chennai", name: "Chennai" },
  { slug: "mumbai", name: "Mumbai" }, { slug: "delhi", name: "Delhi" },
  { slug: "pune", name: "Pune" }, { slug: "coimbatore", name: "Coimbatore" },
];

export default function LaptopsPage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <LocalTechNav />

      <section style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%)" }} className="pt-24 pb-20 px-4 text-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-6">
              💻 Same-day Laptop Repair — All Brands
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Laptop Repair at Your Desk</h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-gray-300 text-lg max-w-2xl mb-8 leading-relaxed">
              Dell, HP, Lenovo, Asus, Acer, MacBook — all brands. LocalTech&apos;s certified laptop technicians come to your home or office with parts for most common repairs. No 3-day wait. No data handover.
            </p>
          </Reveal>
          <Reveal delay={300} className="flex flex-col sm:flex-row gap-4">
            <Link href="/book" className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-lg transition">Book Laptop Repair →</Link>
            <a href="tel:+918008001234" className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-xl text-lg transition">Call Now</a>
          </Reveal>
          <Reveal delay={400} className="mt-10 grid grid-cols-3 gap-8 max-w-md">
            {[["₹499–₹9,500", "Repair range"], ["2–4 hrs", "Typical fix time"], ["30 days", "Warranty"]].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-2xl font-bold text-blue-400">{val}</div>
                <div className="text-gray-400 text-sm">{lbl}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Laptop problems we fix on-site</h2></Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ISSUES.map((issue, i) => (
              <Reveal key={issue.title} delay={i * 50}>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-full">
                  <div className="text-3xl mb-3">{issue.icon}</div>
                  <div className="font-bold text-gray-900 mb-1">{issue.title}</div>
                  <div className="text-gray-500 text-sm">{issue.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">All laptop brands covered</h2></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {BRANDS.map((b) => (
              <div key={b.name} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <div className="font-bold text-gray-900 text-sm">{b.name}</div>
                <div className="text-gray-400 text-xs mt-0.5">{b.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Laptop repair price guide</h2></Reveal>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Repair Type</th>
                  <th className="text-right px-6 py-3 font-semibold">Price Range</th>
                </tr>
              </thead>
              <tbody>
                {PRICE_GUIDE.map((row, i) => (
                  <tr key={row.issue} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-3 text-gray-800">{row.issue}</td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900">₹{row.from}–₹{row.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-400 text-xs mt-3 text-center">MacBook repairs may vary. Final quote given after diagnosis at your location.</p>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Laptop repair in your city</h2></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CITIES.map((c) => (
              <Link key={c.slug} href={`/laptop-repair-in-${c.slug}`} className="block bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 hover:text-green-700 transition text-center">
                Laptop Repair in {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-green-600 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Book Laptop Repair Now</h2>
          <p className="text-green-100 mb-8">At your desk · No data surrender · 30-day warranty</p>
          <Link href="/book" className="inline-block px-10 py-4 bg-white text-green-700 font-bold rounded-xl text-lg hover:bg-green-50 transition">Book Now →</Link>
        </div>
      </section>
    </div>
  );
}
