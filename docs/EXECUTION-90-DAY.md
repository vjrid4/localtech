# LocalTech: The First 90 Days
## Solo Founder Execution Plan — One City, 200 Technicians, 1,000 Repairs

> Drafted June 2026. Companion doc: [STRATEGY-10-YEAR.md](./STRATEGY-10-YEAR.md)

**Operating constraints that shape every decision below:**
- Solo founder + Claude. No ops team. Every workflow must be self-serve or automatable, with you as the manual fallback.
- You ARE the ops team for the first 100 repairs. The admin console is your real product.
- Build budget: ~₹15–25K/month in services (WhatsApp API, KYC, Razorpay, existing hosting).
- City: **where YOU live** (Vijayawada/Guntur or Hyderabad) — you will visit shops in person.
- Category focus: **mobile repair only** for days 0–45. Other categories accept bookings but route to manual handling.

**The 90-day funnel math (working backwards from 1,000 repairs):**
- 1,000 completed ÷ 12 active weeks ≈ 85/week steady state, ramping 5 → 30 → 80 → 120/week
- At 60% booking→completion → need ~1,700 bookings → ~140/week peak
- 200 technicians is a vanity ceiling; **40 ACTIVE technicians** (3+ jobs/week) carries 120 repairs/week. Recruit 200, activate 40.

---

## 1. Phase 1 Architecture

**Rule: change as little as possible. The stack is already right.**

```
┌─────────────────────────────────────────────────────┐
│  Next.js 16 monolith (existing)                     │
│  ├─ Public: /, /book, /track/[ref], /t/[slug]       │
│  ├─ Dashboards (existing) + /dashboard/jobs (new)   │
│  ├─ /admin/* (new — your ops cockpit)               │
│  └─ /api/* (existing + ~25 new routes)              │
├─────────────────────────────────────────────────────┤
│  PostgreSQL (existing devicedna DB)                 │
│  + Event table (append-only log)                    │
│  + node-cron worker for: dispatch timeouts,         │
│    review nudges, score recompute                   │
├─────────────────────────────────────────────────────┤
│  External services (all webhook-driven):            │
│  ├─ WhatsApp: AiSensy or Interakt (₹999–2.5K/mo,    │
│  │   wraps Meta Cloud API — do NOT integrate Meta   │
│  │   directly as a solo founder)                    │
│  ├─ Razorpay: Payment Links v1 (NOT full checkout — │
│  │   links are 10× less code)                       │
│  ├─ KYC: Surepass/Signzy (₹15–30/verification)      │
│  └─ Geo: pincode→lat/lng static table (free India   │
│      pincode CSV) — NOT Google Maps API in v1       │
└─────────────────────────────────────────────────────┘
```

**Explicit non-decisions (deferred past day 90):** Redis/queues (Postgres polling fine at 200 jobs/day), microservices, mobile app (technician dashboard is mobile-web; WhatsApp is the real technician app), live location tracking, in-app chat, parts marketplace, payouts/wallets.

**v1 money flow**: customer pays technician directly (UPI/cash); **LocalTech invoices technicians weekly for commission** — not escrow. Lose payment data fidelity, gain 6 weeks of build time and zero supply resistance. Razorpay Payment Links offered as *option* on track page; adoption data tells you when to force the rail.

---

## 2. Missing Database Models

```prisma
// ───── Geo & supply ─────
model TechnicianProfile {
  id                String   @id @default(cuid())
  technicianId      String   @unique
  technician        Technician @relation(fields: [technicianId], references: [id])
  publicSlug        String   @unique
  photoUrl          String?
  bio               String?
  yearsExperience   Int      @default(0)
  languages         String[] @default(["telugu", "hindi"])
  categories        String[]                  // MOBILE, TV, ...
  pincodes          String[]                  // serviceable pincodes
  homePincode       String?
  whatsappNumber    String                    // dispatch channel — REQUIRED
  verificationLevel VerificationLevel @default(UNVERIFIED)
  kycStatus         KycStatus @default(NOT_STARTED)
  kycData           Json?                     // provider response, masked aadhaar
  trustScore        Float    @default(50)     // Bayesian prior
  isActive          Boolean  @default(false)  // admin-controlled go-live switch
  acceptingJobs     Boolean  @default(true)   // technician-controlled
  totalCompleted    Int      @default(0)
  totalRedos        Int      @default(0)
  createdAt         DateTime @default(now())
}

enum VerificationLevel { UNVERIFIED  ID_VERIFIED  FIELD_VERIFIED }
enum KycStatus { NOT_STARTED  PENDING  PASSED  FAILED  MANUAL_REVIEW }

model Pincode {                               // seeded from India pincode CSV
  pincode  String @id
  city     String
  district String
  state    String
  lat      Float?
  lng      Float?
}

// ───── Dispatch ─────
model Dispatch {
  id            String   @id @default(cuid())
  bookingId     String   @unique
  booking       BookingRequest @relation(fields: [bookingId], references: [id])
  status        DispatchStatus @default(PENDING)
  wave          Int      @default(0)          // escalation wave counter
  assignedTechId String?
  assignedAt    DateTime?
  offers        DispatchOffer[]
  createdAt     DateTime @default(now())
}

enum DispatchStatus { PENDING  OFFERED  ASSIGNED  EXPIRED_TO_MANUAL  CANCELLED }

model DispatchOffer {
  id           String   @id @default(cuid())
  dispatchId   String
  technicianId String
  status       OfferStatus @default(SENT)
  sentAt       DateTime @default(now())
  respondedAt  DateTime?
  expiresAt    DateTime                       // sentAt + 10 min
  @@unique([dispatchId, technicianId])
}
enum OfferStatus { SENT  VIEWED  ACCEPTED  DECLINED  EXPIRED }

// ───── Job (marketplace repair — distinct from shop CRM Repair) ─────
model Job {
  id            String    @id @default(cuid())
  reference     String    @unique             // reuse LT-XXXXXXX from booking
  bookingId     String    @unique
  technicianId  String
  status        JobStatus @default(ASSIGNED)
  quoteAmount   Int?                          // paise
  quoteApprovedAt DateTime?
  completedAt   DateTime?
  cancelReason  String?
  commissionDue Int       @default(0)
  review        Review?
  warranty      Warranty?
  statusHistory Json[]    @default([])        // [{status, at, by}]
  createdAt     DateTime  @default(now())
}
enum JobStatus { ASSIGNED  EN_ROUTE  DIAGNOSED  QUOTED  QUOTE_APPROVED
                 IN_PROGRESS  COMPLETED  CANCELLED  DISPUTED }

// ───── Trust ─────
model Review {
  id           String   @id @default(cuid())
  jobId        String   @unique
  rating       Int                            // 1–5
  text         String?
  technicianId String                         // denormalized
  isPublic     Boolean  @default(true)
  createdAt    DateTime @default(now())
}

model Warranty {
  id          String   @id @default(cuid())
  jobId       String   @unique
  startsAt    DateTime @default(now())
  expiresAt   DateTime                        // startsAt + 30 days
  status      WarrantyStatus @default(ACTIVE)
  claims      WarrantyClaim[]
}
enum WarrantyStatus { ACTIVE  EXPIRED  CLAIMED  VOID }

model WarrantyClaim {
  id          String   @id @default(cuid())
  warrantyId  String
  description String
  status      ClaimStatus @default(OPEN)
  redoJobId   String?
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())
}
enum ClaimStatus { OPEN  REDO_SCHEDULED  RESOLVED  REJECTED }

// ───── Event log (the 10-year decision) ─────
model Event {
  id        BigInt   @id @default(autoincrement())
  type      String                            // "booking.created", "offer.accepted", ...
  actorType String                            // CUSTOMER, TECHNICIAN, ADMIN, SYSTEM
  actorId   String?
  subjectType String                          // "job", "dispatch", "technician"
  subjectId String
  payload   Json?
  createdAt DateTime @default(now())
  @@index([subjectType, subjectId])
  @@index([type, createdAt])
}
```

Also: add `dispatch Dispatch?` + `pincode String?` to existing `BookingRequest`, and `profile TechnicianProfile?` to existing `Technician`.

---

## 3. Missing API Endpoints

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/track/[reference]` | — public | Booking + job status, technician card, warranty card |
| `POST /api/track/[reference]/claim` | — public (phone match) | File warranty claim |
| `POST /api/technicians/apply` | — public | Technician application (creates User + Technician + Profile, `isActive=false`) |
| `POST /api/kyc/start` | JWT(TECH) | Create KYC session with provider |
| `POST /api/webhooks/kyc` | signature | Provider callback → set `kycStatus`, fire event |
| `GET /api/jobs` | JWT(TECH) | Technician's offers + active jobs |
| `POST /api/offers/[id]/accept` · `/decline` | JWT(TECH) | Respond to dispatch offer (accept is atomic — §5) |
| `PATCH /api/jobs/[id]/status` | JWT(TECH) | Status transitions; each fires WhatsApp + Event |
| `POST /api/jobs/[id]/quote` | JWT(TECH) | Set quote → customer notified |
| `POST /api/track/[reference]/approve-quote` | — public | One-tap quote approval from WhatsApp link |
| `POST /api/reviews` | — public (signed token) | Submit rating from WhatsApp link |
| `POST /api/webhooks/whatsapp` | signature | Inbound: "1" to accept job; everything else → your inbox |
| `GET/PATCH /api/admin/technicians` | JWT(ADMIN) | Approve, activate, suspend, edit pincodes |
| `GET/PATCH /api/admin/bookings` | JWT(ADMIN) | All bookings, manual assign/reassign, cancel |
| `GET /api/admin/dispatches` | JWT(ADMIN) | Live dispatch board, stuck-job alerts |
| `GET/PATCH /api/admin/claims` | JWT(ADMIN) | Warranty claim queue → schedule redo |
| `GET /api/admin/metrics` | JWT(ADMIN) | Funnel + supply + quality + economics (§13) |
| `POST /api/admin/dispatch/[id]/assign` | JWT(ADMIN) | Manual assignment override |

Note: `ADMIN` role exists in the enum but has no routes today. Add `requireRole("ADMIN")` to `lib/auth/middleware.ts`.

---

## 4. Missing Pages

| Page | Notes |
|---|---|
| `/track/[reference]` | **The most important page in the company.** Status timeline, technician card, quote approve, warranty card + claim, review prompt. Public, mobile-first, <2s on 3G. |
| `/technician/apply` | Public application, 3 minutes max. |
| `/dashboard/technician/jobs` | Offer inbox (accept/decline with countdown) + active jobs + quote entry. The technician's whole world. |
| `/dashboard/technician/onboarding` | Checklist: profile → KYC → quiz → activation status |
| `/t/[slug]` | Public technician profile: photo, score, completed count, reviews, badges. SEO begins here. |
| `/admin` + sub-pages | §8 |
| `/review/[token]` | One-page star tap + optional text, from WhatsApp link. No login. |

---

## 5. Dispatch Engine

**Design: wave-based broadcast with single-winner atomic accept.** No ML — a ranked SQL query and a cron loop.

```
Booking created (pincode + category known)
  → create Dispatch
  → WAVE 0: offer to top 3 eligible technicians via WhatsApp
       eligible = isActive ∧ acceptingJobs ∧ category match ∧ pincode match
       rank = trustScore DESC, then least-recently-assigned (fairness rotation)
  → each offer expires in 10 min
  → cron (60s): no acceptance + wave age > 10 min → WAVE 1: next 5
  → WAVE 2 (10 more min): all remaining eligible
  → nothing after 30 min → EXPIRED_TO_MANUAL
       → WhatsApp alert to YOUR phone → manual assign or call customer
```

**First accept wins — atomic via conditional update:**

```typescript
const result = await prisma.$transaction(async (tx) => {
  const claimed = await tx.dispatch.updateMany({
    where: { id: dispatchId, status: { in: ["PENDING", "OFFERED"] } },
    data: { status: "ASSIGNED", assignedTechId: techId, assignedAt: new Date() },
  });
  if (claimed.count === 0) return { won: false };       // someone beat them
  await tx.dispatchOffer.update({ where: { id: offerId }, data: { status: "ACCEPTED", respondedAt: new Date() } });
  await tx.dispatchOffer.updateMany({ where: { dispatchId, status: "SENT" }, data: { status: "EXPIRED" } });
  const job = await tx.job.create({ data: { /* from booking */ } });
  return { won: true, job };
});
```

Acceptance: tap in `/dashboard/technician/jobs`, or **reply "1" to the WhatsApp offer** (inbound webhook → same endpoint). WhatsApp will carry 80% of acceptances.

**SLA targets**: median time-to-assign < 8 min; >90% auto-assigned by week 8. Both on admin metrics from day one.

---

## 6. Technician Onboarding

**Funnel: Apply → Screen → KYC → Quiz → Field test → Active.** Target ~35% conversion (recruit 600 applicants → 200 verified → ~40 truly active).

1. **Apply** (`/technician/apply`, 3 min) — auto-creates account, WhatsApp confirmation with verification link
2. **Your screen** (admin queue, <24h SLA) — eyeball photo/experience/pincodes; one tap approve → KYC invite
3. **KYC** (§7) — self-serve via link
4. **Category quiz** — 15 MCQs from a 60-question bank (real Indian fault scenarios). 70% pass, one retry/week. Filters pretenders cheaply.
5. **Field probation IS the skill test** — first 5 jobs flagged; you call the customer personally after each. 5 clean → `FIELD_VERIFIED`. A redo during probation → deactivate, review.
6. **Activation** — flip `isActive`; "You're live" WhatsApp with public profile link — **engineered shareable moment** (they forward it; it recruits the next technician).

**Recruiting reality (solo founder)**: digital ads won't reach these guys efficiently.
- (a) Walk the mobile-repair market streets with a one-page Telugu flyer + QR
- (b) Recruit shop *owners* first via the free CRM pitch, convert their technicians
- (c) ₹250 referral credit per activated referral
- Budget 2 days/week of YOUR time on the street, weeks 3–8. Not delegable, not skippable.

---

## 7. KYC Flow

Use **Surepass or Signzy** (Aadhaar OKYC + PAN + face match, ~₹20–35/verification; 200 technicians ≈ ₹6K total).

```
/dashboard/technician/onboarding → "Verify Identity"
 1. Aadhaar number → provider /okyc/initiate → OTP to Aadhaar-linked mobile
 2. OTP entered → provider returns name, photo, DOB, masked aadhaar
 3. PAN number → verify → name-match against Aadhaar name (fuzzy ≥ 0.8)
 4. Selfie upload → face-match vs Aadhaar photo (≥ 0.75)
 5. All pass → kycStatus=PASSED, verificationLevel=ID_VERIFIED, event logged
    Soft-fail → MANUAL_REVIEW → your admin queue
```

Storage: masked Aadhaar (XXXX-XXXX-1234), name, DOB, face-match score, provider verification ID only. **Never store full Aadhaar or raw images.** Selfie becomes profile photo with consent.

Failure UX: 3 retries (mostly typos/OTP issues), then auto-route to MANUAL_REVIEW with "we'll call you" — don't silently lose supply at KYC.

---

## 8. Admin Console

**YOUR cockpit — 4+ hours/day for 90 days. Optimize for your speed, not beauty.**

- **`/admin` overview** — alert tiles, red when nonzero: unassigned dispatches > 15 min · stuck jobs (no change 4h) · KYC manual reviews · open claims · pending applications · today's funnel
- **`/admin/dispatch`** — live board: every open dispatch, wave, offers, one-click manual assign, cancel-with-reason. **Build before the automated dispatcher** — manual dispatch for the first 50 jobs teaches you what the algorithm should do.
- **`/admin/bookings`** — all bookings, filters, click-to-call, notes
- **`/admin/technicians`** — application queue, KYC review (provider data side-by-side), roster with per-technician stats, activate/suspend
- **`/admin/claims`** — claims queue, one-click "schedule redo" (linked redo Job, different technician by default)
- **`/admin/metrics`** — §13

Every admin action writes to `Event` so future-you can reconstruct any disputed job.

---

## 9. WhatsApp Workflow

WhatsApp is the product's nervous system. Via AiSensy/Interakt. **Submit ALL templates in week 1** (Meta approval takes 1–3 days each).

**Customer journey:**
1. `booking_confirmed` — "Booking {ref} received! Finding you a verified technician. Track: {link}"
2. `technician_assigned` — "{name} (⭐{score}, {n} repairs) will call within 30 min. Profile: {link}"
3. `quote_ready` — "Repair quote: ₹{amt}. Reply YES or approve: {link}"
4. `job_completed` — "Done! 30-day warranty until {date}. Warranty card: {link}"
5. `review_request` (4h after) — "How was {name}'s service? Tap to rate: {link}"
6. `warranty_reminder` (day 25) — "Warranty ends in 5 days — any issues? Free redo: {link}" *(converts silent dissatisfaction into a fixable claim — you WANT claims)*

**Technician journey:**
7. `job_offer` — "🔧 New job: {device}, {issue}, {area}. Est ₹{band}. Reply 1 to ACCEPT (10 min)"
8. `job_won` / `job_missed`
9. `kyc_nudge`, `activation_congrats`, `weekly_summary`

**Inbound routing**: "1"/"YES" → accept/approve endpoints; everything else → forwarded to your phone with context link. You are the support bot for 90 days; log every inbound to `Event`.

Cost: 1,000 repairs × ~8 messages ≈ ₹6–8K total. Irrelevant.

---

## 10. Ratings System

- **Trigger**: WhatsApp 4h post-completion, reminder at 48h; signed JWT token link (no login) → `/review/[token]`. Target ≥45% submission.
- **Verified-only**: reviews exist only behind completed jobs. No public "write a review" anywhere — the integrity foundation.
- **1–2 star handling**: held from public 24h, instant alert to you, same-day recovery call. The review still publishes after — **never suppress, only respond.**
- **Display**: `/t/[slug]`, track page, homepage testimonials (real ones replace the placeholders — the only homepage change allowed).
- **TrustScore v1 (nightly cron)**: `bayesian_avg(rating, prior=4.2, weight=5) × 20 − redo_penalty(10 pts per redo in last 20 jobs) + recency boost`. Revisit at 500 reviews.

---

## 11. Warranty Workflow

Every COMPLETED job auto-creates a 30-day `Warranty`. Card on track page + WhatsApp.

```
Claim filed (customer, track page)
 → WhatsApp alert to you + /admin/claims
 → Triage within 4h (call customer):
    ├─ Legit, same fault → REDO_SCHEDULED: redo Job (₹0 to customer),
    │    DIFFERENT technician by default. Redo counts against original
    │    technician's score; redo technician paid by LocalTech (₹150–300 flat).
    │    ~3–5% claim rate × redo cost = your trust marketing budget.
    ├─ Different fault → new paid booking, courtesy discount
    └─ Abuse/physical damage → REJECTED with photo evidence
 → Customer confirmation WhatsApp → RESOLVED
```

Rule told to every technician at activation: **>2 redos in 20 jobs = suspension review.** The warranty is the quality measurement, the marketing differentiator, and the supply filter simultaneously.

---

## 12. Event Logging System

```typescript
// lib/events.ts
export async function logEvent(e: {
  type: string;                    // "job.completed", "offer.declined"
  actorType: "CUSTOMER" | "TECHNICIAN" | "ADMIN" | "SYSTEM";
  actorId?: string;
  subjectType: string; subjectId: string;
  payload?: Record<string, unknown>;
}) {
  await prisma.event.create({ data: e });     // fire-and-forget, never throws to caller
}
```

Canonical Phase-1 event types (~25): `booking.created`, `dispatch.created`, `offer.sent/viewed/accepted/declined/expired`, `dispatch.escalated/expired_to_manual`, `job.assigned/status_changed/quoted/quote_approved/completed/cancelled`, `kyc.started/passed/failed/manual_review`, `technician.applied/approved/activated/suspended`, `review.requested/submitted`, `warranty.created/claim_filed/redo_scheduled/claim_resolved`, `whatsapp.sent/delivered/inbound`, `admin.manual_assign/override`.

Rules: append-only, no updates ever; payloads carry before/after snapshots; **every §13 metric is computed FROM this table** (forcing function that keeps logging honest). Diagnosis labels, fraud baselines, and dispatch ML all train on it later.

---

## 13. Analytics Dashboards

`/admin/metrics` — four panels, all SQL over `Event` + core tables (no warehouse, no Mixpanel):

**Demand funnel (weekly cohorts)**: bookings → dispatched → assigned → completed → reviewed, conversion % at each edge. The number that runs the company: **booking→completion ≥60%**.

**Supply health**: applications→activated funnel; active technicians (≥1 job/7d); acceptance rate (**<40% means offers are unattractive — check price expectations or area mismatch**); median time-to-accept; per-technician league table.

**Quality**: avg rating (≥4.3), % jobs rated, redo rate (≤5%), claims open >48h (0), recovery-call completion.

**Unit economics (the honest panel)**: avg job value · commission *collected* (not booked) · WhatsApp+KYC+infra cost per job · redo cost per job · contribution per job. Target by day 90: **₹80–120 contribution/repair at 10% commission** (₹120 on ₹1,200 AOV − ~₹15 messaging/infra − ~₹15 amortized redo). CAC ≈ 0 (SEO + local + word-of-mouth); the model works the moment commission collection works — weekly invoice discipline is a week-5 ticket, not someday.

---

## 14. Launch Plan

**Phase A — Supply-first stealth (weeks 3–6)**: recruit and verify BEFORE driving demand. Demand with no supply burns customers permanently; supply with no demand merely needs cheerleading.

**Phase B — Friendly demand (weeks 6–8)**: 50 repairs from your network — friends, family, WhatsApp groups, apartment societies. Hand-hold every job. First reviews, testimonials, and process bugs at low stakes.

**Phase C — Public launch (week 8)**, channels in cost order:
1. **Apartment/society WhatsApp groups** — highest-intent free channel in Indian local services
2. **Google Business Profile** + local SEO pages (`/mobile-repair-in-{area}` × 15–20) — a weekend, given the programmatic SEO playbook
3. **Repaired-device QR sticker** — on every device from day one
4. **₹100-off referral** both sides, link in `job_completed`
5. **Instagram/Facebook local ads** — ₹500/day cap, only after 1–4 measured, only into pincodes with ≥3 active technicians

**Launch gate checklist (all green before public demand):**
- [ ] 30+ active technicians covering top-20 pincodes
- [ ] Dispatch auto-assign >80% in friendly phase
- [ ] Track page solid on cheap Android/3G
- [ ] All WhatsApp templates approved
- [ ] Warranty redo flow exercised at least twice for real
- [ ] Your phone receives every alert

---

## 15. Week-by-Week Roadmap with Tickets

Capacity: ~25 productive build-hrs/week with Claude + 10 hrs/week field ops from week 3. Sizes: S(≤half day) M(1 day) L(2–3 days).

### Weeks 1–2 — Foundation sprint (build only)
| # | Ticket | Size | Depends on |
|---|---|---|---|
| T1 | Prisma migration: all §2 models + Pincode seed (India CSV) | M | — |
| T2 | `lib/events.ts` + wire into existing booking/auth flows | S | T1 |
| T3 | WhatsApp BSP account + submit ALL templates + `lib/whatsapp.ts` + inbound webhook skeleton | M | — (day 1 — approval latency) |
| T4 | `requireRole("ADMIN")` + seed admin user | S | — |
| T5 | `/admin` shell + `/admin/bookings` | M | T4 |
| T6 | `/admin/technicians` — queues, roster, activate toggle | L | T4, T1 |
| T7 | `/technician/apply` page + endpoint | M | T1 |
| T8 | KYC provider account + `/api/kyc/start` + webhook + onboarding checklist page | L | T7 |
| T9 | `/track/[reference]` v1 (booking status; job states stubbed) | M | T1 |

### Weeks 3–4 — Dispatch + technician surface (build 60% / field 40%)
| # | Ticket | Size | Depends on |
|---|---|---|---|
| T10 | Dispatch engine: wave logic, cron worker, atomic accept | L | T1, T3 |
| T11 | `/admin/dispatch` live board + manual assign | M | T10 |
| T12 | `/dashboard/technician/jobs` — offer inbox + status flow + quotes | L | T10 |
| T13 | WhatsApp inbound "1"-to-accept routing | M | T3, T10 |
| T14 | Job status engine: transitions, history, WhatsApp per transition, quote→approve flow | L | T10, T3 |
| T15 | Quiz: 60-question bank + quiz UI + pass-gate | M | T8 |
| T16 | **Field**: street recruiting begins — target 60 applications | — | T7 |

### Weeks 5–6 — Trust layer + friendly launch (build 50% / ops 50%)
| # | Ticket | Size | Depends on |
|---|---|---|---|
| T17 | Track page v2: technician card, quote approval, live status | M | T14, T9 |
| T18 | Reviews: signed-token links, `/review/[token]`, 4h/48h nudges, 1–2★ alert | M | T14, T3 |
| T19 | `/t/[slug]` public profiles | M | T18 |
| T20 | Warranty: auto-create, card, claim flow, `/admin/claims`, redo-job creation | L | T14 |
| T21 | TrustScore nightly cron v1 | S | T18, T20 |
| T22 | **Ops**: friendly launch — 50 hand-held repairs | — | T10–T20 |
| T23 | **Field**: 100+ applications, 30+ activated | — | T16 |

### Weeks 7–8 — Hardening + public launch
| # | Ticket | Size | Depends on |
|---|---|---|---|
| T24 | `/admin/metrics` all four panels | M | T2 |
| T25 | Razorpay Payment Link option + weekly commission invoice flow | M | T14 |
| T26 | Warranty day-25 reminder + technician weekly summary crons | S | T20, T3 |
| T27 | Local SEO: `/mobile-repair-in-[area]` × 20 + GBP listing | M | — |
| T28 | QR stickers designed + printed + code → track/booking redirect | S | — |
| T29 | Bug-bash; 3G/low-end Android pass on track + technician pages | M | T22 |
| T30 | **PUBLIC LAUNCH** — gate checklist green | — | all |

### Weeks 9–12 — Scale ops, build only what friction demands
| # | Ticket | Size | Notes |
|---|---|---|---|
| T31 | Referral credits (₹100 both sides) | M | demand lever |
| T32 | Dispatch tuning from data: waves, ranking, expiry | S | needs ~200 dispatches |
| T33 | FIELD_VERIFIED auto-badge at 25 clean jobs + congrats | S | retention lever |
| T34 | Second category go-live (TV or appliance) — config + recruit, no new code | M | only if mobile >80/wk |
| T35 | Review-recovery + claims SOPs written (documenting your job for the first ops hire) | S | |
| T36 | Weekly metrics email to yourself (forcing function) | S | T24 |
| — | **Ops focus**: 80→120 repairs/week, 40+ weekly-active technicians, commission collection ≥90% | | the actual job |

### Day-90 success criteria
- ✅ 200 verified (ID_VERIFIED+) technicians; **≥40 weekly-active**
- ✅ 1,000 completed jobs, booking→completion ≥60%
- ✅ Avg rating ≥4.3, ≥45% review rate, redo rate ≤5%
- ✅ Dispatch auto-assign ≥90%, median assign <8 min
- ✅ Commission collection ≥90%, contribution ≥₹80/repair
- ✅ Every event since day 1 in the `Event` table

### The three things that kill this plan if neglected
1. **Skipping street recruiting weeks 3–8** — no code substitutes for supply
2. **Opening public demand before the gate checklist** — burned early customers in one city never return
3. **Deferring commission collection "until later"** — collect from job #1, even manually, or you'll discover at day 90 that you have a charity, not a marketplace
