"use client";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";
const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const APPLIANCES = [
  { icon: "❄️", name: "Refrigerator", desc: "Not cooling, compressor, water leak" },
  { icon: "🫧", name: "Washing Machine", desc: "Not spinning, error codes, drainage" },
  { icon: "🌡️", name: "AC Service", desc: "Gas refill, cooling issues, deep clean" },
  { icon: "🍳", name: "Microwave Oven", desc: "Not heating, turntable, door switch" },
  { icon: "💨", name: "Water Purifier", desc: "Filter change, RO membrane, TDS" },
  { icon: "🌀", name: "Mixer / Grinder", desc: "Motor, brush, jar, coupler repair" },
];

export default function AppliancesPage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LocalTechNav />
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-4 py-1.5 text-cyan-600 text-sm font-medium mb-6">Coming Soon</div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900" style={jk}>Home Appliance Repair</h1>
        <p className="text-gray-500 text-xl max-w-xl mx-auto mb-14 leading-relaxed">
          We&apos;re onboarding certified appliance technicians. These repairs will be available on LocalTech very soon.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-14">
          {APPLIANCES.map((a, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-left hover:shadow-sm transition">
              <div className="text-3xl mb-3">{a.icon}</div>
              <h3 className="font-bold text-gray-900 text-sm mb-1" style={jk}>{a.name}</h3>
              <p className="text-xs text-gray-500">{a.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="px-7 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition">
            ← Back to Home
          </Link>
          <Link href="/mobiles" className="px-7 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition">
            Book Mobile Repair Now
          </Link>
        </div>
      </div>
    </div>
  );
}
