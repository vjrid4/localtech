import Link from "next/link";
import type { CityData } from "@/lib/seo/cities";
import { cityHash } from "@/lib/seo/repair-content";
import LocalTechNav from "@/components/LocalTechNav";

function pick<T>(arr: T[], slug: string, offset = 0): T {
  const h = Math.abs(cityHash(slug + offset));
  return arr[h % arr.length];
}

interface Props {
  city: CityData;
}

const TECH_TESTIMONIALS = [
  (city: string) => ({
    name: "Suresh B.",
    exp: "4 years experience",
    text: `I was doing repairs from home with no steady income. After joining LocalTech in ${city}, I now get 8–10 jobs a day on average. The app routes jobs to me automatically — no marketing on my side.`,
  }),
  (city: string) => ({
    name: "Manoj R.",
    exp: "6 years experience",
    text: `The LocalTech CRM keeps track of every job, customer, and warranty. Before this I used a notebook. My income doubled in ${city} within three months of joining the platform.`,
  }),
  (city: string) => ({
    name: "Ranjit K.",
    exp: "3 years experience",
    text: `What I value most is the dispute backing. If a customer complains about a repair in ${city}, LocalTech investigates fairly — it's not always the tech's fault. That protection matters.`,
  }),
  (city: string) => ({
    name: "Arjun P.",
    exp: "5 years experience",
    text: `I moved to ${city} from a smaller town. Without LocalTech I would have spent six months building a customer base. The platform gave me jobs from day one of going active.`,
  }),
];

const TECH_FAQS = [
  {
    q: "How do I apply to join LocalTech as a technician?",
    a: "Go to localtech.in/technician/apply, fill in your details and service city, and upload your ID. Our team reviews applications within 48 hours and contacts you to schedule the skills assessment.",
  },
  {
    q: "How much can I earn as a LocalTech technician?",
    a: "Earnings depend on daily jobs and average ticket size. Our technicians doing 8 jobs/day at an average of ₹800/job earn roughly ₹40,000–₹50,000/month after platform commission. See the earnings table below for scenarios.",
  },
  {
    q: "Do I need my own shop to join LocalTech?",
    a: "No shop required. LocalTech is a doorstep-repair model — you go to the customer. You need your own tools, a two-wheeler for transport, and a smartphone to use the technician app.",
  },
  {
    q: "What does LocalTech's platform commission cover?",
    a: "The commission covers job routing, CRM software, customer support, dispute resolution, and warranty backing. You don't pay any upfront fee — commission is deducted from completed jobs only.",
  },
  {
    q: "What training or certification do I need to join?",
    a: "You need at least 2 years of hands-on mobile repair experience (or equivalent training). During onboarding you'll take a short knowledge quiz and a field test. LocalTech also provides training modules for newer technicians.",
  },
];

export default function CityTechnicianPage({ city }: Props) {
  const testimonialFns = [0, 1, 2].map((i) => pick(TECH_TESTIMONIALS, city.slug + i));
  const testimonials = testimonialFns.map((fn) => fn(city.name));

  const scenarios = [
    { jobs: 5, ticket: 700, commission: 0.15 },
    { jobs: 8, ticket: 800, commission: 0.15 },
    { jobs: 12, ticket: 900, commission: 0.15 },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: `Mobile Repair Technician – ${city.name}`,
            description: `Join LocalTech as a verified mobile repair technician in ${city.name}. Earn ₹25,000–₹60,000/month. Doorstep jobs routed to you. No marketing needed.`,
            hiringOrganization: { "@type": "Organization", name: "LocalTech", sameAs: "https://localtech.in" },
            jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: city.name, addressRegion: city.state, addressCountry: "IN" } },
            employmentType: "CONTRACTOR",
            baseSalary: { "@type": "MonetaryAmount", currency: "INR", value: { "@type": "QuantitativeValue", minValue: 25000, maxValue: 60000, unitText: "MONTH" } },
          }),
        }}
      />

      <LocalTechNav />

      {/* Hero */}
      <section
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #064e3b 60%, #0f172a 100%)" }}
        className="pt-24 pb-16 px-4 text-white"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Earn ₹25,000–₹60,000/month as a {city.name} Mobile Repair Technician
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-8 leading-relaxed">
            LocalTech routes verified repair jobs directly to you in {city.name} — from {city.areas[0]}, {city.areas[1]}, {city.areas[2]}, and across the city. No marketing, no cold calls. Just jobs.
          </p>
          <Link
            href="/technician/apply"
            className="inline-block bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your potential monthly income in {city.name}</h2>
          <p className="text-gray-500 mb-8">Based on average ticket sizes and 15% platform commission on completed jobs.</p>
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-6 py-4 font-semibold">Jobs / day</th>
                  <th className="text-left px-6 py-4 font-semibold">Avg ticket</th>
                  <th className="text-left px-6 py-4 font-semibold">Monthly revenue</th>
                  <th className="text-left px-6 py-4 font-semibold">Your take-home</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scenarios.map((s) => {
                  const monthly = s.jobs * s.ticket * 26;
                  const takehome = Math.round(monthly * (1 - s.commission));
                  return (
                    <tr key={s.jobs} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{s.jobs} jobs</td>
                      <td className="px-6 py-4 text-gray-700">₹{s.ticket}</td>
                      <td className="px-6 py-4 text-gray-700">₹{monthly.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 font-semibold text-green-700">₹{takehome.toLocaleString("en-IN")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What we provide */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What LocalTech provides in {city.name}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: "📲", title: "Job pipeline", desc: "Repair requests from customers in your area are routed to your app automatically. No marketing on your end." },
              { icon: "🗂️", title: "CRM app", desc: "Track every job, customer, estimate, and payment from your phone. Invoices generated automatically." },
              { icon: "🛡️", title: "Warranty backing", desc: "LocalTech backs the 30-day warranty issued to customers. If a part fails, the platform covers the replacement cost." },
              { icon: "⚖️", title: "Dispute support", desc: "If a customer raises a complaint, our team investigates objectively — techs aren't blamed without evidence." },
              { icon: "📊", title: "Weekly income summary", desc: "Every Sunday you receive a detailed breakdown of jobs completed, revenue earned, and commission deducted." },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What you need to join</h2>
          <ul className="space-y-3">
            {[
              "Mobile repair tools (screwdrivers, suction, spudgers, hot air station)",
              "Two-wheeler for doorstep service in {city.name}",
              "Android smartphone to run the LocalTech technician app",
              "2 years of mobile repair experience — or equivalent training",
              "Valid government-issued photo ID (Aadhaar/PAN/passport)",
            ].map((req) => (
              <li key={req} className="flex items-start gap-3">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <span className="text-gray-700">{req.replace("{city.name}", city.name)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How onboarding works in {city.name}</h2>
          <div className="grid sm:grid-cols-5 gap-6">
            {[
              { n: "1", title: "Apply online", desc: "Fill the application at localtech.in/technician/apply. Takes 5 minutes." },
              { n: "2", title: "Phone screening", desc: "Our team calls within 48 hours to discuss your experience and service area in {city.name}." },
              { n: "3", title: "KYC verification", desc: "Submit your Aadhaar, PAN, and a selfie. Background check runs in parallel." },
              { n: "4", title: "Skills quiz", desc: "A 20-question online quiz covering common repair scenarios, parts identification, and safety." },
              { n: "5", title: "Field test & activation", desc: "Complete one supervised repair. Pass and your profile goes live on the platform — jobs start routing to you." },
            ].map((step) => (
              <div key={step.n} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white font-bold flex items-center justify-center mx-auto mb-3">
                  {step.n}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{step.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{step.desc.replace("{city.name}", city.name)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Technicians already earning in {city.name}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                <div className="text-gray-500 text-xs">{t.exp}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">FAQ — joining LocalTech in {city.name}</h2>
          <div className="space-y-3">
            {TECH_FAQS.map((faq, i) => (
              <details key={i} className="group border border-gray-200 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition-colors list-none">
                  <span>{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-gray-600 leading-relaxed text-sm">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="py-16 px-4 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Start earning in {city.name} with LocalTech</h2>
          <p className="text-gray-300 mb-8">
            Apply today. Background check and skills assessment typically complete within 5 working days.
          </p>
          <Link
            href="/technician/apply"
            className="inline-block bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors"
          >
            Apply Now — It's Free
          </Link>
        </div>
      </section>
    </>
  );
}
