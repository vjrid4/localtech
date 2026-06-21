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
  { icon: "🔋", title: "Solar Inverter Repair", desc: "Grid-tie, off-grid, and hybrid inverter faults. Luminous, Microtek, Su-Kam, Growatt." },
  { icon: "☀️", title: "Panel Inspection & Cleaning", desc: "Output testing, hot-spot detection, cleaning for max efficiency." },
  { icon: "📊", title: "Battery Bank Repair", desc: "Lead-acid and lithium battery diagnosis, cell replacement, capacity testing." },
  { icon: "⚡", title: "MPPT / PWM Controller", desc: "Charge controller fault diagnosis and replacement." },
  { icon: "🔌", title: "Wiring & Earthing Audit", desc: "DC/AC cable inspection, earthing check, junction box repair." },
  { icon: "🌐", title: "Net Metering Support", desc: "Bi-directional meter setup, DISCOM documentation support." },
];

const BRANDS = ["Luminous", "Microtek", "Su-Kam", "Growatt", "Delta", "Fronius", "Enphase", "SMA", "Havells", "UTL Solar", "All Others"];

const SYSTEMS = [
  { type: "Home Solar System", desc: "1–10 kW rooftop solar — panel repair, inverter service, battery maintenance." },
  { type: "Commercial Rooftop", desc: "10–100 kW systems — performance audit, string inverter repair, monitoring." },
  { type: "Solar Water Pump", desc: "DC pump controller, submersible pump, panel mismatch diagnosis." },
  { type: "Solar Street Lights", desc: "Battery, charge controller, LED driver replacement." },
];

export default function SolarPage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <LocalTechNav />

      <section style={{ background: "linear-gradient(135deg,#0f172a 0%,#713f12 50%,#064e3b 100%)" }} className="pt-24 pb-20 px-4 text-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 rounded-full px-4 py-1.5 text-yellow-300 text-sm font-medium mb-6">
              ☀️ Solar Panel & Inverter Repair
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Solar System Repair & Maintenance</h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-gray-300 text-lg max-w-2xl mb-8 leading-relaxed">
              Solar inverter faults, panel output loss, battery bank issues, charge controller failure — LocalTech&apos;s certified solar technicians diagnose and fix your system at your premises with a written report and 30-day warranty.
            </p>
          </Reveal>
          <Reveal delay={300} className="flex flex-col sm:flex-row gap-4">
            <Link href="/book" className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl text-lg transition">Book Solar Service →</Link>
            <a href="tel:+918008001234" className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-xl text-lg transition">Call Now</a>
          </Reveal>
          <Reveal delay={400} className="mt-10 grid grid-cols-3 gap-8 max-w-md">
            {[["₹799+", "Service from"], ["Same day", "Response"], ["30 days", "Warranty"]].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{val}</div>
                <div className="text-gray-400 text-sm">{lbl}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Solar services we provide</h2></Reveal>
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
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">System types we service</h2></Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {SYSTEMS.map((s) => (
              <div key={s.type} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="font-bold text-gray-900 mb-1">☀️ {s.type}</div>
                <div className="text-gray-600 text-sm">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal><h2 className="text-2xl font-bold text-gray-900 mb-6">Solar brands we service</h2></Reveal>
          <div className="flex flex-wrap gap-3 justify-center">
            {BRANDS.map((b) => (
              <span key={b} className="px-4 py-2 bg-white rounded-lg text-gray-700 text-sm font-medium border border-gray-200">{b}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-green-600 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Book Solar Service Now</h2>
          <p className="text-green-100 mb-8">At your premises · Written diagnosis report · 30-day warranty</p>
          <Link href="/book" className="inline-block px-10 py-4 bg-white text-green-700 font-bold rounded-xl text-lg hover:bg-green-50 transition">Book Now →</Link>
        </div>
      </section>
    </div>
  );
}
