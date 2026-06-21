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

const SERVICES = [
  { icon: "📷", title: "New CCTV Installation", desc: "Home, shop, office, warehouse — cameras installed, cabled, and configured." },
  { icon: "🌙", title: "Night Vision Not Working", desc: "IR LED repair, night vision module, lens cleaning for low-light cameras." },
  { icon: "💾", title: "DVR / NVR Repair", desc: "Hard drive, firmware, output port, and recording issue diagnosis and fix." },
  { icon: "📡", title: "IP / Wi-Fi Camera Issues", desc: "Network config, app setup, remote access via mobile." },
  { icon: "🔌", title: "Cable / Power Faults", desc: "BNC, power adapter, PoE switch, and wiring repair." },
  { icon: "🌐", title: "Remote Viewing Setup", desc: "Configure DDNS, port forwarding, mobile app access for your DVR/NVR." },
];

const BRANDS = [
  { name: "Hikvision", note: "DS-2CD, ColorVu, AcuSense" },
  { name: "CP Plus", note: "Full HD, A4K, Cosmic, Penta" },
  { name: "Dahua", note: "WizSense, WizMind, XVR" },
  { name: "Bosch", note: "FLEXIDOME, AUTODOME" },
  { name: "Godrej", note: "SeeThru, G-Cam series" },
  { name: "All Others", note: "Any brand, analog or IP" },
];

const PACKAGES = [
  { pkg: "Home Starter", cameras: "2 cameras", dvr: "4-channel DVR", storage: "1 TB HDD", price: "₹8,500 installed" },
  { pkg: "Home Security", cameras: "4 cameras", dvr: "4-channel DVR", storage: "1 TB HDD", price: "₹14,000 installed" },
  { pkg: "Shop / Office", cameras: "8 cameras", dvr: "8-channel DVR", storage: "2 TB HDD", price: "₹24,000 installed" },
];

export default function CCTVPage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <LocalTechNav />

      <section style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)" }} className="pt-24 pb-20 px-4 text-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-6">
              📷 CCTV Installation & Repair — All Brands
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">CCTV Installation & Repair</h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-gray-300 text-lg max-w-2xl mb-8 leading-relaxed">
              New CCTV installation or repair of existing cameras — LocalTech&apos;s certified security technicians handle Hikvision, CP Plus, Dahua, and all brands. Home, shop, office, factory. Written quote, 30-day warranty.
            </p>
          </Reveal>
          <Reveal delay={300} className="flex flex-col sm:flex-row gap-4">
            <Link href="/book" className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-lg transition">Get Free Quote →</Link>
            <a href="tel:+918008001234" className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-xl text-lg transition">Call Now</a>
          </Reveal>
          <Reveal delay={400} className="mt-10 grid grid-cols-3 gap-8 max-w-md">
            {[["2–4 hrs", "Installation time"], ["₹499+", "Repair from"], ["30 days", "Warranty"]].map(([val, lbl]) => (
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
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">CCTV services we provide</h2></Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-full">
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <div className="font-bold text-gray-900 mb-1">{s.title}</div>
                  <div className="text-gray-500 text-sm">{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">CCTV installation packages</h2></Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {PACKAGES.map((p) => (
              <div key={p.pkg} className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                <div className="font-bold text-gray-900 text-lg mb-3">{p.pkg}</div>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <div>{p.cameras}</div>
                  <div>{p.dvr}</div>
                  <div>{p.storage}</div>
                </div>
                <div className="text-green-600 font-bold text-lg">{p.price}</div>
                <Link href="/book" className="block mt-4 px-5 py-2.5 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition">Get Quote</Link>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-4 text-center">Prices include installation, cabling, and DVR setup. Camera models: CP Plus / Hikvision 2 MP HD.</p>
        </div>
      </section>

      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">CCTV brands we service</h2></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BRANDS.map((b) => (
              <div key={b.name} className="bg-white rounded-xl p-4 border border-gray-100 flex gap-3 items-center">
                <span className="text-2xl">📷</span>
                <div>
                  <div className="font-bold text-gray-900">{b.name}</div>
                  <div className="text-gray-500 text-xs">{b.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-green-600 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Book CCTV Service Now</h2>
          <p className="text-green-100 mb-8">Installation or repair · Free on-site quote · 30-day warranty</p>
          <Link href="/book" className="inline-block px-10 py-4 bg-white text-green-700 font-bold rounded-xl text-lg hover:bg-green-50 transition">Book Now →</Link>
        </div>
      </section>
    </div>
  );
}
