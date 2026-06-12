import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import LocalTechNav from "@/components/LocalTechNav";

/**
 * /t/[slug] — public technician profile (T19). Server-rendered for SEO;
 * the shareable "you're live on LocalTech" page and the trust surface
 * customers see from the track page.
 */

export const dynamic = "force-dynamic";

const jk = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const CAT_LABEL: Record<string, string> = {
  mobile: "📱 Mobiles", tv: "📺 TVs", laptop: "💻 Laptops",
  appliance: "🧊 Appliances", cctv: "📷 CCTV", solar: "☀️ Solar",
};
const LEVEL_BADGE: Record<string, { label: string; cls: string }> = {
  ID_VERIFIED: { label: "✓ ID Verified", cls: "bg-green-100 text-green-700" },
  FIELD_VERIFIED: { label: "✓✓ Field Verified", cls: "bg-emerald-600 text-white" },
};

async function getProfile(slug: string) {
  return prisma.technicianProfile.findUnique({
    where: { publicSlug: slug },
    include: {
      user: { select: { name: true, createdAt: true } },
      reviews: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { rating: true, text: true, createdAt: true },
      },
    },
  });
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProfile(slug);
  if (!p || !p.isActive) return { title: "Technician — LocalTech" };
  return {
    title: `${p.user.name} — Verified Technician | LocalTech`,
    description: `${p.user.name}: verified repair technician on LocalTech. ${p.totalCompleted} repairs completed. Book trusted repairs with a 30-day warranty.`,
  };
}

export default async function TechnicianProfilePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const p = await getProfile(slug);
  if (!p || !p.isActive) notFound();

  const ratings = p.reviews.map((r) => r.rating);
  const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;
  const level = LEVEL_BADGE[p.verificationLevel];
  const memberSince = new Date(p.user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LocalTechNav />
      <div className="pt-28 pb-20 px-4 max-w-lg mx-auto">

        {/* Identity card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5 text-center">
          {p.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.photoUrl} alt={p.user.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3 ring-4 ring-green-100" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-green-500 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-3 ring-4 ring-green-100">
              {p.user.name[0]}
            </div>
          )}
          <h1 className="text-2xl font-bold" style={jk}>{p.user.name}</h1>
          {level && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${level.cls}`}>{level.label}</span>
          )}
          <p className="text-xs text-gray-400 mt-2">On LocalTech since {memberSince}{p.yearsExperience > 0 ? ` · ${p.yearsExperience} yrs experience` : ""}</p>

          {/* Numbers dominate */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div>
              <p className="text-2xl font-bold text-green-600" style={jk}>{Math.round(p.trustScore)}</p>
              <p className="text-xs text-gray-400">Trust score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900" style={jk}>{p.totalCompleted}</p>
              <p className="text-xs text-gray-400">Repairs done</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500" style={jk}>{avg ? avg.toFixed(1) : "—"}</p>
              <p className="text-xs text-gray-400">{ratings.length > 0 ? `${ratings.length} rating${ratings.length > 1 ? "s" : ""}` : "No ratings yet"}</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h2 className="font-bold mb-3 text-sm" style={jk}>Repairs</h2>
          <div className="flex flex-wrap gap-2">
            {p.categories.map((c) => (
              <span key={c} className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm">{CAT_LABEL[c] ?? c}</span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Serves {p.pincodes.length} area{p.pincodes.length !== 1 ? "s" : ""}{p.homePincode ? ` around ${p.homePincode}` : ""}</p>
        </div>

        {/* Reviews */}
        {p.reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <h2 className="font-bold mb-4 text-sm" style={jk}>Customer reviews</h2>
            <div className="space-y-4">
              {p.reviews.map((r, i) => (
                <div key={i} className={i > 0 ? "pt-4 border-t border-gray-50" : ""}>
                  <p className="text-amber-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  {r.text && <p className="text-sm text-gray-600 mt-1">{r.text}</p>}
                  <p className="text-xs text-gray-300 mt-1">
                    Verified repair · {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link href="/book" className="inline-block w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition">
            Book a Repair
          </Link>
          <p className="text-xs text-gray-400 mt-2">Every LocalTech repair includes a 30-day warranty</p>
        </div>
      </div>
    </div>
  );
}
