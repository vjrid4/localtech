"use client";

/*
 * LOCALTECH — Consumer Homepage
 *
 * Hero voiceover script (for video production):
 * "Every day, millions of Indian families rely on their devices to connect, work, and learn.
 *  A cracked screen shouldn't stop a student from attending class.
 *  A broken refrigerator shouldn't spoil a family's week.
 *  A faulty AC shouldn't make a summer unbearable.
 *  LocalTech connects you with skilled, verified technicians right in your neighbourhood.
 *  Fast. Affordable. Trustworthy. That's the LocalTech promise."
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";

function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

const STATS = [
  { value: "50,000+", label: "Repairs Completed" },
  { value: "2,000+", label: "Verified Technicians" },
  { value: "200+", label: "Cities Covered" },
  { value: "4.8 ★", label: "Average Rating" },
];

const STEPS = [
  { icon: "📝", title: "Describe the Problem", desc: "Tell us what's broken. Takes 60 seconds." },
  { icon: "🔍", title: "Get Matched Instantly", desc: "Verified technicians near you with the right skills." },
  { icon: "💬", title: "Receive a Digital Estimate", desc: "Transparent, itemised cost before work begins." },
  { icon: "📅", title: "Confirm & Schedule", desc: "Pick your time. Morning, afternoon or evening." },
  { icon: "✅", title: "Repair Done + Warranty", desc: "Device fixed, warranty issued, history saved." },
];

const CATEGORIES = [
  { icon: "📱", title: "Mobile Repair", desc: "Screen, battery, charging port, water damage", href: "/mobiles", color: "from-blue-50 to-blue-100", accent: "#3b82f6" },
  { icon: "📺", title: "TV Repair", desc: "LED, LCD, OLED — display issues, power faults", href: "/tv", color: "from-purple-50 to-purple-100", accent: "#8b5cf6" },
  { icon: "💻", title: "Laptop Repair", desc: "Screen, keyboard, hinge, battery, motherboard", href: "/laptops", color: "from-slate-50 to-slate-100", accent: "#475569" },
  { icon: "❄️", title: "Refrigerator", desc: "Not cooling, compressor noise, water leakage", href: "/appliances", color: "from-cyan-50 to-cyan-100", accent: "#06b6d4" },
  { icon: "🫧", title: "Washing Machine", desc: "Not spinning, water leak, error codes", href: "/appliances", color: "from-sky-50 to-sky-100", accent: "#0ea5e9" },
  { icon: "🌡️", title: "AC Service", desc: "Gas refill, deep clean, cooling issues, install", href: "/appliances", color: "from-teal-50 to-teal-100", accent: "#14b8a6" },
  { icon: "📷", title: "CCTV Systems", desc: "Installation, DVR issues, cable faults, upgrades", href: "/cctv", color: "from-orange-50 to-orange-100", accent: "#f97316" },
  { icon: "☀️", title: "Solar & Inverter", desc: "Panel cleaning, battery, wiring, inspection", href: "/solar", color: "from-yellow-50 to-amber-100", accent: "#f59e0b" },
];

const TRUST = [
  { icon: "🛡️", title: "Verified Technicians", desc: "Background check, skill test and ID verification before joining." },
  { icon: "💰", title: "Transparent Pricing", desc: "Itemised digital estimates before work begins. Zero hidden charges." },
  { icon: "📋", title: "Digital Estimates", desc: "PDF estimate on WhatsApp and email. Compare, decide, confirm." },
  { icon: "🔒", title: "Repair Warranty", desc: "30-day minimum warranty on every repair. Parts carry 90 days." },
  { icon: "📍", title: "Real-Time Tracking", desc: "Watch your technician travel to you on the map." },
  { icon: "📜", title: "Repair History", desc: "All repairs stored digitally. Accessible anytime." },
];

const TECH_BENEFITS = [
  { icon: "📈", title: "Grow Your Income", desc: "Access verified job requests in your city. Top technicians earn ₹40,000–₹80,000/month." },
  { icon: "📱", title: "Digital Job Management", desc: "Manage bookings, invoices, payments and customers from your phone." },
  { icon: "⭐", title: "Build Your Reputation", desc: "Earn ratings and reviews. Get certified. Stand out from competitors." },
  { icon: "🏦", title: "Fast Payments", desc: "UPI, cash or card. GST-compliant invoices. Weekly settlements." },
  { icon: "🎓", title: "Skill Development", desc: "Repair guides, tutorials and AI diagnostics to stay ahead of new devices." },
];

const SC_BENEFITS = [
  { icon: "🏪", title: "Multi-Branch Management", desc: "Manage all branches from one dashboard. Staff, inventory, revenue unified." },
  { icon: "👨‍🔧", title: "Technician Tracking", desc: "Know what each technician is working on in real-time. Assign in seconds." },
  { icon: "📦", title: "Smart Inventory", desc: "Track spare parts, set reorder alerts, manage suppliers." },
  { icon: "🧾", title: "GST Invoicing", desc: "Auto-generate GST-compliant invoices for every repair." },
  { icon: "📊", title: "Business Analytics", desc: "Revenue trends, technician performance, top repair types." },
  { icon: "💬", title: "Customer WhatsApp Updates", desc: "Automatic status updates to customers. Reduce inbound calls." },
];

const TESTIMONIALS = [
  {
    name: "Ravi Kumar", role: "Software Developer", city: "Bangalore", avatar: "RK", color: "#16a34a", stars: 5,
    text: "My Samsung S22 screen cracked at 11pm on a Sunday. Posted on LocalTech, got a call in 15 minutes. Technician at my door by 9am. Fixed in 45 minutes for ₹1,800 with a 3-month warranty. Genuinely impressed.",
  },
  {
    name: "Sunita Sharma", role: "Homemaker", city: "New Delhi", avatar: "SS", color: "#7c3aed", stars: 5,
    text: "AC stopped working in May. LocalTech found a certified AC technician the same afternoon. Gas refill and service for ₹1,100. The estimate was shared before they started. No arguments, no confusion.",
  },
  {
    name: "Mohammed Irfan", role: "Mobile Repair Technician", city: "Hyderabad", avatar: "MI", color: "#0369a1", stars: 5,
    text: "I used to get 3–4 customers a week through word of mouth. After joining LocalTech I'm doing 15–18 jobs a week. The app manages bookings, invoices, customer history. My income doubled in 4 months.",
  },
  {
    name: "Priya Patel", role: "School Teacher", city: "Mumbai", avatar: "PP", color: "#ea580c", stars: 5,
    text: "Refrigerator stopped cooling on a Saturday afternoon with a full week of groceries inside. LocalTech got a certified appliance technician by 4pm. Compressor capacitor replaced, everything running within 2 hours.",
  },
];

export default function LocalTechHomepage() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroLoaded(true), 100); return () => clearTimeout(t); }, []);

  const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

  return (
    <div className="bg-white" style={{ fontFamily: "'Inter', sans-serif", color: "#111827" }}>
      <LocalTechNav />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 hero-cinematic" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" style={{ animation: "pulse 4s ease-in-out infinite" }} />
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" style={{ animation: "pulse 6s ease-in-out infinite 2s" }} />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-orange-500/8 rounded-full blur-3xl" style={{ animation: "pulse 5s ease-in-out infinite 1s" }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/65" />
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" aria-hidden="true">
          <source src="/videos/localtech-hero.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 text-white text-center max-w-5xl mx-auto px-4 pt-24 pb-36">
          <div style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "none" : "translateY(16px)", transition: "all 0.8s ease" }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full" style={{ animation: "pulse 2s infinite" }} />
              Trusted by 50,000+ customers across India
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6" style={{ ...jk, opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "none" : "translateY(24px)", transition: "all 0.9s ease 0.1s" }}>
            Technology keeps<br /><span className="text-green-400">life moving.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-4 font-medium" style={{ opacity: heroLoaded ? 1 : 0, transition: "opacity 0.9s ease 0.2s" }}>
            When something breaks, LocalTech helps fix it.
          </p>
          <p className="text-base md:text-lg text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed" style={{ opacity: heroLoaded ? 1 : 0, transition: "opacity 0.9s ease 0.3s" }}>
            Find trusted technicians and service centers for mobiles, TVs, appliances, laptops,
            CCTV systems, solar equipment and more — right in your neighbourhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ opacity: heroLoaded ? 1 : 0, transition: "opacity 0.9s ease 0.4s" }}>
            <Link href="/book" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-2xl text-lg transition-all duration-200 shadow-xl shadow-green-500/30 hover:scale-105">
              Get Repair Help
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <a href="#technicians" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur border border-white/25 hover:bg-white/20 text-white font-bold rounded-2xl text-lg transition-all duration-200">
              Join as Technician
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {STATS.map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-white" style={jk}>{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-green-600 text-sm font-bold uppercase tracking-widest mb-4">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4" style={jk}>How LocalTech Works</h2>
            <p className="text-gray-500 text-lg max-w-xl mb-16">From broken to fixed in five easy steps. No guesswork, no overcharging.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center text-4xl">{step.icon}</div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2" style={jk}>{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-green-600 text-sm font-bold uppercase tracking-widest mb-4">All Services</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4" style={jk}>What Can We Fix For You?</h2>
            <p className="text-gray-500 text-lg max-w-xl mb-12">From your phone to your solar panels — LocalTech covers every device in your home.</p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={i} delay={i * 50}>
                <Link href={cat.href} className={`group p-6 rounded-2xl bg-gradient-to-br ${cat.color} border border-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block`}>
                  <div className="text-4xl mb-4">{cat.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base" style={jk}>{cat.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{cat.desc}</p>
                  <div className="text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: cat.accent }}>
                    Book Now
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY TRUST ── */}
      <section id="trust" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <p className="text-green-600 text-sm font-bold uppercase tracking-widest mb-4">Why LocalTech</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6" style={jk}>Built on Trust,<br />Delivered with Care.</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                We know how much it means when your device works. LocalTech was built to make
                repair trustworthy, affordable and convenient for every Indian family.
              </p>
              <a href="#get-help" className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition">
                Get Repair Help Today
              </a>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRUST.map((t, i) => (
                <Reveal key={i} delay={i * 70}>
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="text-3xl mb-3">{t.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-1.5 text-sm" style={jk}>{t.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR TECHNICIANS ── */}
      <section id="technicians" className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <p className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4">For Technicians</p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={jk}>
                Turn your skills into<br /><span className="text-green-400">a thriving business.</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Join 2,000+ technicians already earning more, working smarter and building their
                reputation on LocalTech. No upfront fees. Start earning in 48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register?tab=business&type=TECHNICIAN" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition">
                  Join as Technician →
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 border border-white/20 hover:bg-white/15 text-white font-medium rounded-xl transition">
                  View Dashboard Demo
                </Link>
              </div>
            </Reveal>
            <div className="space-y-4">
              {TECH_BENEFITS.map((b, i) => (
                <Reveal key={i} delay={i * 70}>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition">
                    <div className="text-2xl mt-0.5 shrink-0">{b.icon}</div>
                    <div>
                      <h3 className="font-bold text-white mb-1" style={jk}>{b.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR SERVICE CENTERS ── */}
      <section id="service-centers" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-green-600 text-sm font-bold uppercase tracking-widest mb-4">For Service Centers</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4" style={jk}>Run a smarter, more<br />profitable service center.</h2>
            <p className="text-gray-500 text-lg max-w-2xl mb-14">
              LocalTech gives your service center the digital infrastructure to manage repairs,
              staff, inventory and customers — all in one place.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SC_BENEFITS.map((b, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-green-100 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">{b.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2" style={jk}>{b.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}>
            <div className="mt-12 text-center">
              <Link href="/register?tab=business&type=REPAIR_SHOP_OWNER" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition">
                Register Your Service Center →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── AI DIAGNOSTICS ── */}
      <section id="ai-diagnostics" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)" }} />
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #22c55e 0%, transparent 50%), radial-gradient(circle at 75% 50%, #3b82f6 0%, transparent 50%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <p className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4">Powered by AI</p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-white" style={jk}>
                Describe the problem.<br /><span className="text-green-400">AI diagnoses it.</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                LocalTech's AI engine analyses your device's symptoms and suggests the most likely fault,
                estimated repair cost, and whether it's worth fixing.
              </p>
              <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium inline-block">
                Available now for mobiles · Expanding to all devices
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 font-mono text-sm">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-gray-400">LocalTech AI Diagnostics</span>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs shrink-0">U</div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-gray-200 text-xs leading-relaxed">
                      My Samsung Galaxy S23 screen has vertical lines and part of it is unresponsive after I dropped it.
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold shrink-0">AI</div>
                    <div className="bg-green-500/20 border border-green-500/30 rounded-2xl rounded-tr-none px-4 py-3 text-green-100 text-xs leading-relaxed max-w-xs">
                      <span className="text-green-400 font-bold block mb-2">Analysis complete</span>
                      Likely fault: <span className="text-white">LCD damage from impact</span><br />
                      Confidence: <span className="text-white">94%</span><br />
                      Estimated cost: <span className="text-white">Rs. 3,200-4,800</span><br />
                      Turnaround: <span className="text-white">Same day</span><br /><br />
                      <span className="text-green-300">3 verified technicians available near you</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-green-600 text-sm font-bold uppercase tracking-widest mb-4">Customer Stories</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4" style={jk}>Real people. Real repairs.</h2>
            <p className="text-gray-500 text-lg max-w-xl mb-14">Across India, families and professionals trust LocalTech every day.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex gap-1 mb-5">
                    {Array(t.stars).fill(0).map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 text-base">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: t.color }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm" style={jk}>{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role} &middot; {t.city}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="get-help" className="py-24 bg-green-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={jk}>
              Device broken?<br />Let&apos;s fix that today.
            </h2>
            <p className="text-white/80 text-xl mb-12 max-w-xl mx-auto">
              Tell us what&apos;s wrong. We&apos;ll find you the right technician — near you, right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book" className="px-8 py-4 bg-white text-green-600 font-bold rounded-2xl text-lg hover:bg-gray-50 transition shadow-xl">
                Book a Repair
              </Link>
              <Link href="/appliances" className="px-8 py-4 bg-white/15 border border-white/30 hover:bg-white/25 text-white font-bold rounded-2xl text-lg transition">
                All Other Devices
              </Link>
            </div>
            <p className="mt-8 text-white/60 text-sm">No registration required &middot; Estimates before work begins &middot; Pay after repair</p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-xl font-bold" style={jk}>LocalTech</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">Connecting Technicians,<br />Service Centers &amp; Customers.</p>
              <p className="text-xs text-gray-600">Made with care in India</p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-4">Services</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                {["Mobile Repair", "TV Repair", "Laptop Repair", "Refrigerator", "AC Service", "CCTV Systems", "Solar & Inverter"].map((s) => (
                  <li key={s}><a href="#" className="hover:text-white transition">{s}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                {["For Customers", "For Technicians", "For Service Centers", "AI Diagnostics", "Pricing"].map((s) => (
                  <li key={s}><a href="#" className="hover:text-white transition">{s}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                {["About Us", "Blog", "Careers", "Contact"].map((s) => (
                  <li key={s}><a href="#" className="hover:text-white transition">{s}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} LocalTech. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400 transition">Terms</a>
              <a href="#" className="hover:text-gray-400 transition">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
