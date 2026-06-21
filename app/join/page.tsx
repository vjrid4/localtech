import type { Metadata } from "next";
import Link from "next/link";
import LocalTechNav from "@/components/LocalTechNav";

export const metadata: Metadata = {
  title: "Join LocalTech as a Repair Technician — Earn ₹25,000–₹60,000/month",
  description: "Become a LocalTech verified repair technician. Earn steady income repairing mobiles, TVs, laptops, and appliances in your city. Apply today — free KYC + skills certification.",
  alternates: { canonical: "https://localtech.in/join" },
  openGraph: {
    title: "Join LocalTech — Earn as a Repair Technician",
    description: "KYC-verified, quiz-certified, and earning. Join 150+ technicians on LocalTech.",
    url: "https://localtech.in/join",
    siteName: "LocalTech",
  },
};

const STEPS = [
  { step: "1", title: "Apply in 2 minutes", desc: "Fill a short form with your skills and experience. No fee, no documents needed at this stage.", icon: "📝" },
  { step: "2", title: "KYC Verification", desc: "Aadhaar + PAN verification + a selfie. Takes 24 hours. Your identity is verified once — permanently.", icon: "✅" },
  { step: "3", title: "Skills Quiz", desc: "A 15-question online quiz on repair fundamentals. Score 70% to pass. Free retake after 7 days if needed.", icon: "🧠" },
  { step: "4", title: "Go Live", desc: "Your profile goes live. You start receiving job requests in your city immediately after activation.", icon: "🚀" },
  { step: "5", title: "Get Paid", desc: "Complete jobs, collect payment on the spot. Weekly earnings summary in your dashboard.", icon: "💰" },
];

const SERVICES = [
  { icon: "📱", label: "Mobile / Smartphone" },
  { icon: "📺", label: "LED / Smart TV" },
  { icon: "💻", label: "Laptop & MacBook" },
  { icon: "❄️", label: "AC & Refrigerator" },
  { icon: "👕", label: "Washing Machine" },
  { icon: "🌀", label: "Mixer Grinder" },
  { icon: "💨", label: "BLDC / Ceiling Fan" },
  { icon: "🚿", label: "Geyser / Water Heater" },
  { icon: "💧", label: "RO / Water Purifier" },
  { icon: "📦", label: "Microwave Oven" },
  { icon: "📷", label: "CCTV / Security Cameras" },
  { icon: "☀️", label: "Solar Inverters" },
];

const EARNINGS = [
  { label: "2 jobs/day", amount: "₹25,000–₹35,000/month", tag: "Part-time" },
  { label: "4 jobs/day", amount: "₹45,000–₹60,000/month", tag: "Full-time" },
  { label: "6 jobs/day", amount: "₹65,000–₹90,000/month", tag: "Expert" },
];

const FAQ = [
  {
    q: "Do I need prior experience to apply?",
    a: "Yes — LocalTech is for practicing repair technicians. You should have at least 1 year of hands-on repair experience. Students learning repair are welcome to apply once they have practical skills.",
  },
  {
    q: "Is there any registration fee?",
    a: "No. Applying, KYC verification, and the skills quiz are completely free. LocalTech earns only when you earn — a small platform commission per completed job.",
  },
  {
    q: "Do I need my own tools and parts?",
    a: "Yes. LocalTech technicians carry their own tools and commonly used spare parts. The platform connects you with customers and manages job flow — you handle the technical work.",
  },
  {
    q: "What is the referral bonus?",
    a: "Refer another technician using your referral code. When they activate (pass KYC + quiz), both you and they receive ₹100 credited to your LocalTech wallet.",
  },
  {
    q: "What cities does LocalTech operate in?",
    a: "We're live in 100+ cities across Telangana and Andhra Pradesh, and expanding across India. If your city isn't listed yet, apply anyway — we'll notify you when your city launches.",
  },
];

export default function JoinPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: "Repair Technician",
            description: "Join LocalTech as a certified repair technician. Earn ₹25,000–₹60,000/month repairing mobiles, TVs, laptops, and appliances in your city.",
            hiringOrganization: { "@type": "Organization", name: "LocalTech", sameAs: "https://localtech.in" },
            jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "IN" } },
            employmentType: "CONTRACTOR",
            baseSalary: {
              "@type": "MonetaryAmount",
              currency: "INR",
              value: { "@type": "QuantitativeValue", minValue: 25000, maxValue: 90000, unitText: "MONTH" },
            },
          }),
        }}
      />

      <LocalTechNav />

      {/* Hero */}
      <section
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#064e3b 60%,#0f172a 100%)" }}
        className="pt-24 pb-20 px-4 text-white text-center"
      >
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-4 py-1.5 text-green-300 text-sm font-medium mb-6">
            🔧 Now onboarding in 100+ cities
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Turn your repair skills<br />into steady income
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Join LocalTech as a verified repair technician. Get a steady flow of doorstep repair jobs in your city — mobile, TV, laptop, AC, and more.
          </p>
          {/* Earnings highlight */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            {EARNINGS.map((e) => (
              <div key={e.tag} className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-center">
                <div className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-1">{e.tag} · {e.label}</div>
                <div className="text-white font-bold text-lg">{e.amount}</div>
              </div>
            ))}
          </div>
          <Link
            href="/technician/apply"
            className="inline-block px-10 py-4 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-lg transition"
          >
            Apply Now — It&apos;s Free →
          </Link>
          <p className="text-gray-500 text-sm mt-3">No registration fee · Takes 2 minutes</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            How to join LocalTech
          </h2>
          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-5 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-lg flex items-center justify-center">
                  {s.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{s.icon}</span>
                    <span className="font-bold text-gray-900">{s.title}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            What can you repair on LocalTech?
          </h2>
          <p className="text-gray-500 mb-8">Apply with one or more specialisations. You choose what jobs to accept.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SERVICES.map((s) => (
              <div key={s.label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-gray-800 font-medium text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Why technicians choose LocalTech
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: "📍", title: "Jobs near you", desc: "Job requests are matched to your location. No long commutes — serve your own neighbourhood." },
              { icon: "💳", title: "Same-day payments", desc: "Collect payment directly from customers. Track your earnings in real-time on your technician dashboard." },
              { icon: "📋", title: "No price negotiation", desc: "LocalTech publishes fixed price ranges. Customers know what to expect — you spend time repairing, not bargaining." },
              { icon: "⭐", title: "Build a public profile", desc: "Every completed job builds your review score. High-rated technicians earn a FIELD_VERIFIED badge and get priority job routing." },
              { icon: "🔗", title: "Your own referral code", desc: "Refer other technicians with your LT-XXXXXX code. Both of you earn ₹100 when they activate." },
              { icon: "📱", title: "Job inbox on mobile", desc: "Accept or decline jobs from your phone. Set availability, mark jobs complete, and access your repair history anytime." },
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

      {/* FAQ */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="border border-gray-200 rounded-xl">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-green-600 list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-green-500 text-lg ml-2 flex-shrink-0">+</span>
                </summary>
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-green-600 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Ready to start earning?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Apply now. KYC verification in 24 hours. First job within the week.
          </p>
          <Link href="/technician/apply" className="inline-block px-10 py-4 bg-white text-green-700 font-bold rounded-xl text-lg hover:bg-green-50 transition">
            Apply as a Technician →
          </Link>
          <p className="text-green-200 text-sm mt-4">Already a technician? <Link href="/login" className="underline">Log in to your dashboard</Link></p>
        </div>
      </section>
    </>
  );
}
