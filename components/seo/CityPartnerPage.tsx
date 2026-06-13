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

const OWNER_TESTIMONIALS = [
  (city: string) => ({
    name: "Naresh M.",
    shop: "NM Mobile Care",
    text: `We were using WhatsApp to track repairs. After switching to LocalTech's free CRM in ${city}, we cut turnaround time by 30% and stopped losing track of estimates. The platform jobs are a bonus.`,
  }),
  (city: string) => ({
    name: "Sunita B.",
    shop: "QuickFix Zone",
    text: `I was skeptical about a free CRM. In ${city}, the LocalTech platform has sent us 20–25 extra bookings a month on top of our own customers. The GST invoicing alone saves us 2 hours a week.`,
  }),
  (city: string) => ({
    name: "Prakash G.",
    shop: "Gadget Doctors",
    text: `Hiring vetted technicians in ${city} used to be a nightmare. Now I post on LocalTech and get applications from pre-screened techs. Saved three months of bad hiring in our first year on the platform.`,
  }),
  (city: string) => ({
    name: "Ramesh T.",
    shop: "TechCure Services",
    text: `Our profile on LocalTech gets us customers from across ${city} who wouldn't have found us otherwise. The branded page and review system have helped us build trust faster than word-of-mouth alone.`,
  }),
];

const OWNER_FAQS = [
  {
    q: "Is the LocalTech CRM really free for shop owners?",
    a: "Yes — the CRM (repair tracking, customer records, estimates, invoices, inventory) is completely free for registered partner shops. We make money only when the platform sends you a customer and you complete the job. No monthly subscription, no hidden fees.",
  },
  {
    q: "How does LocalTech send customers to my shop?",
    a: "When a customer in your city books a repair, LocalTech's algorithm matches them to the nearest verified shop or technician. As a registered partner, your shop is included in that matching pool for your service areas.",
  },
  {
    q: "What commission does LocalTech charge on referral jobs?",
    a: "A flat 12–15% on jobs sourced through the LocalTech platform. There's no charge on your own customers who come directly to your shop — the CRM is yours to use for free regardless.",
  },
  {
    q: "How long does partner verification take?",
    a: "Verification typically takes 3–5 working days. Our team verifies your shop address, GST (if applicable), and a brief video call to confirm your workshop setup. Once approved, your profile goes live on localtech.in.",
  },
  {
    q: "Can I hire LocalTech-verified technicians for my shop?",
    a: "Yes. Partner shops get access to the LocalTech technician pool. You can post technician requirements on the platform and hire from our pre-screened, skills-tested applicants — saving you the vetting effort.",
  },
];

export default function CityPartnerPage({ city }: Props) {
  const testimonialFns = [0, 1, 2].map((i) => pick(OWNER_TESTIMONIALS, city.slug + i));
  const testimonials = testimonialFns.map((fn) => fn(city.name));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `Partner with LocalTech — ${city.name} Repair Shops`,
            description: `Grow your ${city.name} repair shop with LocalTech's free CRM, platform customer referrals, and verified technician hiring. No upfront cost.`,
            url: `https://localtech.in/partner-with-localtech-${city.slug}`,
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
            Grow Your {city.name} Repair Shop with LocalTech
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-8 leading-relaxed">
            Free CRM software for your repairs, invoices, and inventory — plus a steady stream of customers from the LocalTech platform. {city.name} shops are already using it. Setup takes 10 minutes.
          </p>
          <Link
            href="/register?tab=business&type=REPAIR_SHOP_OWNER"
            className="inline-block bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors"
          >
            Become a Partner
          </Link>
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What you get as a LocalTech partner in {city.name}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🗂️",
                title: "Free CRM software",
                desc: "Track repairs by status, generate GST invoices, manage inventory, and search customer history — all at no cost. Replaces spreadsheets and WhatsApp tracking.",
              },
              {
                icon: "👥",
                title: "Customer referrals",
                desc: `Customers booking on localtech.in in ${city.name} are matched to nearby verified shops. Your shop gets in front of customers who never would have found you otherwise.`,
              },
              {
                icon: "🌐",
                title: "Branded profile page",
                desc: `A public shop profile on localtech.in with your services, pricing, hours, and verified reviews — ranked in search results for ${city.name} repair queries.`,
              },
              {
                icon: "🔧",
                title: "Hire verified technicians",
                desc: "Post technician requirements and hire from LocalTech's pre-screened, skills-tested pool — background checks and quiz scores included.",
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

      {/* How Partnership Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How partnership works in {city.name}</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                n: "1",
                title: "Register your shop",
                desc: `Sign up at localtech.in/register in under 10 minutes. Add your shop name, address in ${city.name}, and the services you offer.`,
              },
              {
                n: "2",
                title: "Get verified",
                desc: "Our team verifies your shop address and workshop setup via a brief video call. Most shops are approved within 3–5 working days.",
              },
              {
                n: "3",
                title: "Go live on the platform",
                desc: `Your shop profile appears on localtech.in, you gain access to the CRM, and platform jobs in ${city.name} start routing to you based on proximity and service match.`,
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

      {/* Pricing */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, honest pricing</h2>
          <p className="text-gray-500 mb-8">No monthly subscription. No upfront cost. No surprise fees.</p>
          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
              <div className="text-4xl font-bold text-green-600 mb-2">Free</div>
              <div className="font-semibold text-gray-900 mb-4">CRM Software</div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Repair job tracking</li>
                <li>✓ Customer records</li>
                <li>✓ Estimate and invoice generation (with GST)</li>
                <li>✓ Inventory management</li>
                <li>✓ Technician management</li>
              </ul>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
              <div className="text-4xl font-bold text-gray-900 mb-2">12–15%</div>
              <div className="font-semibold text-gray-900 mb-4">Commission on platform jobs only</div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Only on jobs LocalTech sends you</li>
                <li>✓ Zero commission on your own customers</li>
                <li>✓ No lock-in or minimum job requirements</li>
                <li>✓ Weekly payout to your bank account</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop owners using LocalTech in {city.name}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                <div className="text-gray-500 text-xs">{t.shop}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">FAQ for {city.name} repair shop owners</h2>
          <div className="space-y-3">
            {OWNER_FAQS.map((faq, i) => (
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

      {/* Partner CTA */}
      <section className="py-16 px-4 bg-gray-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your {city.name} repair shop?</h2>
          <p className="text-gray-300 mb-8">
            Join LocalTech for free. Setup takes 10 minutes. First platform customers arrive within 7 days of going live.
          </p>
          <Link
            href="/register?tab=business&type=REPAIR_SHOP_OWNER"
            className="inline-block bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors"
          >
            Become a Partner — Free
          </Link>
        </div>
      </section>
    </>
  );
}
