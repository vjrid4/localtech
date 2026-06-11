# LocalTech: The 10-Year Strategy
## From Repair CRM to India's Technical Services Operating System

> Drafted June 2026. Companion doc: [EXECUTION-90-DAY.md](./EXECUTION-90-DAY.md)

The core insight that changes everything: **RepairDesk sells software to shops. Urban Company rents leads to workers. Nobody owns the data layer of India's ₹80,000+ crore repair economy** — who fixed what, how, with which part, and whether it held. That data layer is the company. Everything below is in service of building it.

The strategic reframe: LocalTech is not a marketplace. It is **three compounding assets wearing a marketplace as a distribution costume**:

1. **The Identity Asset** — verified, skill-graphed technicians (India has ~4M informal technicians, ~0 of them credentialed)
2. **The Device Asset** — permanent repair histories (the "CARFAX of Indian devices")
3. **The Knowledge Asset** — the largest fault→solution graph for the Indian device ecosystem (Chinese brands, voltage conditions, dust/humidity failure modes that iFixit will never cover)

---

# PART 1: Product Gap Analysis

## What exists today (honest assessment)
A well-built **single-shop repair CRM with a consumer booking funnel stapled on**. The booking request (`BookingRequest`) doesn't even connect to a repair (`repairId` is nullable and nothing fills it). There is no marketplace — there's a form and a phone call.

## Strategic capability gaps

### Tier 0 — Marketplace doesn't actually function (existential)
| Gap | Why it's existential |
|---|---|
| **Booking → dispatch → assignment loop** | A booking creates a DB row; no technician ever sees it. There is no supply-side inbox, no acceptance flow, no routing. The marketplace transaction does not exist. |
| **Geo layer** | No lat/long anywhere in the schema. No serviceable-area concept, no "technicians near you," no pincode coverage map. India marketplaces live and die on pincode density. |
| **Payments & escrow** | No payment rail. No way to collect, hold, split, or refund money. Without it, LocalTech never sits in the transaction — it's JustDial. |
| **Customer↔technician communication** | No chat, no masked calling, no status notifications. Today the platform gets disintermediated on the first phone call. |
| **Repair tracking by reference** | Customer gets `LT-XXXXXXX` and... nothing. The single most retention-critical page doesn't exist. |
| **Admin/ops console** | `BusinessLead` and `BookingRequest` rows are invisible. No internal tooling = no operations = no marketplace. |

### Tier 1 — No trust infrastructure
- **No verification**: anyone is a "verified technician" because nothing verifies anyone (no Aadhaar/PAN KYC, no background check, no skill assessment)
- **No ratings/reviews**: `Review` model doesn't exist
- **No warranty system**: "30-day warranty" is marketing copy with no `Warranty` model, no claim flow, no enforcement
- **No dispute resolution**: no flow for "they made it worse"
- **No insurance/protection plan**: the highest-margin product in this category doesn't exist

### Tier 2 — No supply-side economics
- **No technician earnings/payout system** (wallets, settlements, TDS handling)
- **No lead pricing / commission engine**
- **Supplier "dashboard" has no commerce**: no catalog, no ordering, no parts marketplace connecting 1 supplier to N shops
- **No financing**: working capital for parts is the #1 pain of small shops; nobody lends to them because nobody has their cash-flow data — *LocalTech will*

### Tier 3 — No data/intelligence layer
- AI diagnosis is a mock; no feedback loop from actual repair outcomes
- Device Health Passport returns hardcoded JSON; no device identity resolution (IMEI/serial)
- No fault taxonomy, no parts ontology, no repair-case corpus
- No fraud detection of any kind

### Tier 4 — No ecosystem
- No training/certification (the Academy)
- No B2B/enterprise contracts (AMCs for offices, schools, hospitals — the steadiest revenue in this industry)
- No OEM/insurer integrations (authorized out-of-warranty network, insurance claim repairs)
- No recommerce loop (refurbish/resale — repair marketplaces are the natural buy-back channel)
- Categories are six hardcoded strings, not a data model — EV, smart home, drones can't be added without code changes

---

# PART 2: The 5-Year Roadmap

**Sequencing principle**: Close the transaction loop → build trust → own the data → monetize the ecosystem. Each phase funds the next.

## Phase 1 (0–6 months) — "Make the marketplace real"
*Goal: 1 city, 200 verified technicians, 1,000 completed marketplace repairs, NPS > 60.*

| Priority | Feature | Impact rationale |
|---|---|---|
| P0 | **Dispatch engine v1**: booking → notify matching technicians (pincode + category) → first-accept assignment → status flow | Without this, nothing else matters |
| P0 | **Geo schema**: lat/long + pincode + `ServiceArea` on technicians/shops | Prerequisite for matching |
| P0 | **Track-by-reference page** + WhatsApp status notifications (WhatsApp Business API — in India this IS the notification layer, not email) | Retention + trust + "wow" |
| P0 | **Verification v1**: Aadhaar/PAN KYC (DigiLocker/Hyperverge), selfie match, badge on profile | The trust wedge vs. street shops |
| P0 | **Admin ops console**: bookings, leads, assignment overrides, technician approvals | Can't run ops blind |
| P1 | **Razorpay**: collect on completion, split payouts (Razorpay Route), digital receipts | Get into the money flow from day 1 — even at 0% take rate initially |
| P1 | **Ratings & reviews** (post-repair, verified-transaction-only) | Cold-start the reputation engine |
| P1 | **Warranty v1**: every marketplace repair auto-creates a `Warranty` record; claim button on track page | Converts a marketing claim into a structural moat |
| P2 | Wire real Anthropic API for diagnosis + log every diagnosis→outcome pair | Start the AI data flywheel now, even if accuracy is mediocre |

## Phase 2 (6–18 months) — "Trust + supply-side lock-in"
*Goal: 5 cities, 3,000 technicians, monetization on, technicians earning more THROUGH LocalTech than off it.*

- **Trust Score v1** live on profiles (Part 4)
- **Skill assessments**: category-level practical exams → "LocalTech Certified" (Academy v0)
- **Technician wallet + weekly settlements**, earnings dashboard, incentive campaigns
- **Parts marketplace v1**: suppliers list catalogs; shops/technicians order with COD/credit; LocalTech takes 3–5% — *attach parts to repairs and you capture the BOM data the knowledge graph needs*
- **Device Health Passport v1** (real, Part 5): IMEI/serial registration, repair events append automatically
- **Commission/lead-fee engine** + subscription tiers (Part 9)
- **Protection plans v1** (extended warranty on repairs, ₹99–299) — pure margin
- **AMC product for B2B** (offices, PGs, apartments): recurring revenue + dense route efficiency
- **Customer chat/masked calling** (Exotel) — kill disintermediation
- **Fraud detection v1** (Part 4)

## Phase 3 (18–36 months) — "Data network effects"
*Goal: 25 cities, 25,000 technicians, knowledge graph at critical mass, AI measurably better than a senior technician on common faults.*

- **Knowledge Graph public-facing** (Part 7): every repair case feeds it; SEO moat — millions of fault/solution pages generated from *proprietary repair data*, which Google rewards and competitors can't scrape into existence
- **LocalTech Academy full launch** (Part 6): courses, exams, certifications, government skilling partnerships (NSDC/Skill India = subsidized training + legitimacy)
- **Diagnostic AI v2** trained on outcome-labeled repair corpus; cost prediction; technician matching ML
- **Health Passport → resale**: "LocalTech Verified" used-device certificate; partnerships with Cashify/OLX or own recommerce
- **Insurer integrations**: become the repair network for device insurance claims (Acko, Digit, OneAssist)
- **OEM partnerships**: authorized out-of-warranty network for brands with thin service coverage (Chinese brands, D2C appliance brands)
- **New categories via data model, not code**: smart home, EV chargers, e-bikes, drones

## Phase 4 (36–60 months) — "The operating system"
*Goal: 100+ cities, 150,000+ technicians, LocalTech credential is the de facto license to practice.*

- **Financial services**: working-capital loans to shops underwritten on LocalTech cash-flow data (NBFC partnership); technician insurance; equipment financing
- **LocalTech Embedded**: APIs/white-label so OEMs, insurers, and retailers run their service ops on LocalTech rails (the "Shopify of service")
- **EV service network**: the 2029–2031 wave — millions of EVs exiting warranty with no independent repair ecosystem; LocalTech Academy is the only place training EV technicians at scale
- **Device Passport as industry standard**: pushed at point-of-sale through retailer partnerships; resale price premium for passported devices makes consumers demand it
- **International**: Bangladesh, Indonesia, Africa — same informal-technician structure, export the playbook

---

# PART 3: The Identity Layer

**Thesis**: India has no professional identity for technicians. Creating one is the deepest moat available — Urban Company gates supply; LocalTech *credentials* it. A credential is portable, aspirational, and once it's on a technician's WhatsApp status and shop signboard, switching costs are emotional, not contractual.

## TechnicianProfile (extends existing `Technician`)

```prisma
model TechnicianProfile {
  id              String   @id @default(cuid())
  technicianId    String   @unique
  publicSlug      String   @unique          // localtech.in/t/ravi-kumar-hyd — SEO + shareable
  bio             String?
  photoUrl        String?
  yearsExperience Int
  languages       String[]                   // Telugu, Hindi, English — matching input
  lat             Float?
  lng             Float?
  pincodes        String[]                   // serviceable pincodes
  homeBase        String?                    // shop-attached vs independent/mobile
  verificationLevel VerificationLevel @default(UNVERIFIED)
  trustScore      Float    @default(0)       // computed, Part 4
  totalRepairs    Int      @default(0)
  badges          TechnicianBadge[]
  skills          TechnicianSkill[]
  certifications  Certification[]
}

enum VerificationLevel {
  UNVERIFIED        // signed up
  ID_VERIFIED       // Aadhaar/PAN KYC + selfie match
  SKILL_VERIFIED    // passed category assessment
  FIELD_VERIFIED    // 25+ completed repairs, <5% redo rate
  MASTER            // FIELD + advanced certs + mentor status
}
```

Verification pipeline: **DigiLocker Aadhaar pull → PAN match → liveness selfie → criminal-record check (city-tier dependent) → category skill test → probation (first 10 jobs shadow-scored)**. Each level unlocks economics: ID_VERIFIED can take jobs; SKILL_VERIFIED gets priority dispatch; FIELD_VERIFIED gets premium-job access and lower commission; MASTER teaches in the Academy (paid).

## The Skill Graph

Skills are a **DAG, not a list** — this is what makes matching, training, and the knowledge graph interoperate:

```prisma
model Skill {
  id          String  @id @default(cuid())
  slug        String  @unique     // "amoled-replacement", "bldc-motor-rewinding", "ev-bms-diagnosis"
  category    String              // MOBILE, TV, APPLIANCE, LAPTOP, CCTV, SOLAR, SMART_HOME, EV
  parentId    String?             // "micro-soldering" → parent "board-level-repair"
  riskLevel   Int                 // 1-5; gates which jobs require which verification
}

model TechnicianSkill {
  technicianId String
  skillId      String
  source       SkillSource  // SELF_CLAIMED | EXAM_PASSED | FIELD_PROVEN (n successful repairs of this type)
  provenCount  Int @default(0)
  lastUsedAt   DateTime?
  @@id([technicianId, skillId])
}
```

`FIELD_PROVEN` is the killer: skills get *automatically upgraded by completed repair outcomes*. A technician's profile becomes a living transcript of real work — unfakeable, and impossible for a competitor to replicate without the transaction history.

## Certification framework
- **Levels per category**: Associate → Professional → Expert → Master
- Issued as **digitally signed, QR-verifiable certificates** (public verify page — shops frame these)
- 2-year validity, renewal via continuing-education credits or field performance (auto-renew if redo rate < threshold — reward working technicians, don't tax them)
- **Specialist endorsements** stack on top: "Apple Display Specialist," "Inverter AC Specialist," "EV Battery Safety Certified"

---

# PART 4: The Reputation Engine

**Design principle**: ratings are gameable and inflate to 4.8 everywhere; *outcomes* are not. LocalTech's reputation engine is built on warranty claims and redo rates, not stars.

## Trust Score (0–100, public)

```
TrustScore = 30 × RepairSuccess        // jobs completed w/o redo within warranty window
           + 20 × WarrantyIntegrity    // 1 − (claims honored late or disputed / claims)
           + 20 × CustomerSatisfaction // CSAT + NPS, recency-weighted (exponential decay, 90-day half-life)
           + 15 × Reliability          // acceptance rate, on-time arrival, completion vs abandonment
           + 10 × PlatformIntegrity    // no off-platform leakage flags, genuine-parts compliance
           + 5  × Contribution         // knowledge-graph submissions accepted (Part 7)
```

Computed nightly; stored with history (`TrustScoreSnapshot`) so technicians see trends, not just numbers. New technicians get a Bayesian prior (city-category average) so the cold-start isn't a death sentence.

## Core metric definitions
- **Repair Success Rate** = repairs with no warranty claim and no redo request within 30 days / completed repairs. *Requires the warranty system — the warranty isn't a cost center, it's the measurement instrument.*
- **First-Time-Fix Rate** = fixed in one visit / total jobs (the metric B2B clients buy on)
- **Warranty Claim Rate** by technician × fault-type × part-source — this triad exposes everything: bad technicians, bad parts, bad suppliers
- **CSAT**: 2-tap WhatsApp survey post-repair (response rates on WhatsApp in India: 40–60% vs <5% email)

## Fraud Detection (the unglamorous moat)

| Fraud | Signal | Response |
|---|---|---|
| **Off-platform diversion** | Technician accepts → customer cancels → same pair never transacts again; call-masking bypass attempts | Leakage score; repeat = dispatch deprioritization → suspension |
| **Fake reviews / rating rings** | Review bursts, device-fingerprint overlap, reviewer graphs | Verified-transaction-only reviews + graph anomaly detection |
| **Counterfeit parts** | Part claimed "original" + warranty claim rate spike for that technician×part combo | Parts provenance via supplier marketplace; photo evidence on premium repairs |
| **Inflated diagnosis** | Quoted fault ≠ statistically likely fault for symptoms (knowledge graph as ground truth!) | Flag quotes >2σ above predicted cost; offer customer instant second opinion — *turn fraud detection into a consumer feature: "LocalTech Fair Price Check"* |
| **Identity sharing** (verified ID, unverified person shows up) | Random selfie check-ins at job start | Hard suspension; this kills trust brand if it leaks |

Architecture: an `Event` stream (every status change, message, payment, location ping) → rules engine v1 (Phase 1–2) → ML scoring (Phase 3) once labeled fraud cases accumulate. **The knowledge graph doubles as the fraud baseline** — you can't detect an inflated quote without knowing what the repair should cost.

---

# PART 5: Device Health Passport

**Thesis**: India's used-device market is ~$10B+ and runs on zero trust ("seller says battery is fine"). A device with a verifiable service history is worth 10–15% more. Whoever issues that history owns a tax on the entire recommerce economy.

## Device identity resolution
- **Mobiles/laptops**: IMEI / serial number (validate via GSMA TAC database for make/model autofill)
- **Appliances/TVs**: serial + model plate photo (OCR), fallback to platform-issued **LocalTech QR sticker** applied at first repair — the sticker is also marketing on every repaired fridge in the city
- Devices are **platform-level entities, not user-owned rows**: ownership transfers; history persists across owners (current owner controls visibility of personal details, not the event log — like vehicle history)

## The passport ledger

```prisma
model PassportEvent {
  id           String   @id @default(cuid())
  passportId   String
  type         EventType  // REGISTERED, DIAGNOSED, REPAIRED, PART_REPLACED, HEALTH_CHECK, WARRANTY_CLAIM, OWNERSHIP_TRANSFER, CERTIFIED_RESALE
  repairId     String?    // links to actual repair w/ technician, parts, cost band
  partIds      String[]   // exact parts installed — provenance chain to supplier
  healthDelta  Json?      // battery health, screen originality, water-damage flags
  attestedBy   String     // technician/shop ID — events are attestations, not claims
  signature    String     // server-side signed hash; tamper-evident chain (hash includes prev event hash)
  createdAt    DateTime   @default(now())
}
```

Append-only, hash-chained (each event signs the previous — tamper-evident without blockchain theater). Health score becomes **computed from event history** (replacing today's mock): age curve × repair frequency × part quality × category-specific decay models.

## Consumer surface
- `localtech.in/d/{passport-code}` — public verify page: timeline, current health score, "all repairs by verified technicians" badge
- QR on receipt and on device sticker
- **Resale certificate**: paid product (₹199–499) — 30-point inspection by a FIELD_VERIFIED technician + passport history = "LocalTech Certified Pre-Owned"

## Why this compounds
Every marketplace repair auto-creates a passport event at zero marginal cost → passport density grows with GMV → resale buyers ask "does it have a passport?" → sellers get devices repaired *on LocalTech specifically to build history* → repair demand reinforces passport supply. **The rare flywheel where the byproduct becomes the product.**

---

# PART 6: LocalTech Academy

**Thesis**: supply, not demand, is the binding constraint of every service marketplace at scale. The Academy makes LocalTech the *career platform* — technicians join to become more valuable, and the certification only matters inside the ecosystem that recognizes it. India context: ~4M informal technicians; EV/solar/smart-home demand will need ~1M more skilled people by 2030; NSDC partnerships bring subsidies.

## Product structure

```
Course (video, vernacular: Telugu/Hindi/Tamil first, not English)
  └─ Module → Lesson (3–8 min, mobile-first, downloadable for low-bandwidth)
       └─ Quiz
  └─ Exam (proctored)
       ├─ Theory: timed MCQ, question-bank randomized, camera-proctored
       └─ Practical: video-submission of repair on test device w/ rubric, or
          in-person at Skill Centers (partner shops run by MASTER technicians — paid per assessment)
  └─ Certification (Part 3) + Badge
```

**Content engine — the cheat code**: course material is *generated from the Knowledge Graph* (Part 7). Top repair cases become the curriculum, authored/reviewed by MASTER technicians who earn royalties. Content stays current automatically because the graph reflects what's actually breaking in the field *this year*.

## Badges & renewal
- **Earned badges**: certifications, specializations
- **Performance badges** (auto-awarded from field data): "500 Repairs," "Zero Redos – 6 Months," "Same-Day Specialist" — appear on public profiles and in dispatch ranking
- **Renewal**: 2-year cycle; auto-renews if field performance ≥ threshold (work counts as continuing education); otherwise refresher module + exam. Lapsed cert = badge greys out publicly (loss aversion does the enforcement)

## Academy economics
- Free tier: entry courses (funnel for supply acquisition — *the Academy IS the technician acquisition channel*: "Learn AC repair free" ads convert better and cheaper than "join our platform" ads)
- Paid: advanced certs ₹999–4,999; EV/solar certs premium-priced (highest future earnings delta)
- B2B: training-as-a-service for OEM service networks and retail chains
- Govt: NSDC/PMKVY skilling subsidies per certified trainee

---

# PART 7: The Knowledge Graph

**Thesis**: the deepest moat in the entire plan. iFixit covers Western devices in English. Nothing covers a 2022 Lloyd AC's PCB failure mode in Telugu. Every completed LocalTech repair is a labeled training example competitors cannot buy.

## Ontology

```
Device (make, model, variant, year, region-SKU)
  ├─ has → Component (display, PCB, compressor, BMS...)
Symptom ("no power", "screen flicker", "E4 error code", vernacular aliases[])
Fault (root cause: "blown bridge rectifier", "battery cell imbalance")
Part (canonical part + compatible-with[] + supplier listings + grade: OEM/A/B)
Solution (procedure: steps, tools, skillId required, risk level, est. time)
RepairCase (instance: device + symptoms[] + diagnosed fault + solution applied
            + parts used + cost + outcome + warranty result + technicianId)
```

Edges with **outcome-weighted confidence**: `Symptom →(P=0.62, n=1,840)→ Fault →(success=91%)→ Solution`. Probabilities come from real repair cases, recalculated continuously. A warranty claim *decrements* the solution's success weight — the graph learns from failure too.

Storage: Postgres with explicit edge tables to ~10M cases (no graph DB in year one); `pgvector` for symptom-description embeddings (customers describe faults in 10 languages and broken spelling — embedding search is non-negotiable in India).

## Contribution loop
1. **Passive (90% of volume)**: every marketplace repair auto-generates a RepairCase from structured workflow data — diagnosis, parts attached from supplier marketplace, outcome from warranty window. Zero extra technician effort.
2. **Active**: technicians submit repair guides, fault photos, "gotcha" notes → peer-reviewed by MASTER technicians → accepted contributions pay **royalties** (₹ per time their solution is used by another technician) and boost Trust Score. *Stack Overflow's status economy + actual cash.*
3. **Consumption**: technician app surfaces "for these symptoms on this model: top 3 likely faults, parts needed, procedure" → junior technicians perform like seniors → marketplace quality rises → more repairs → more cases. **The graph makes the average technician better, which is the real product.**

## Public face
Programmatic SEO, defensible this time: `localtech.in/fix/samsung-galaxy-m31/battery-drain` pages generated from proprietary case data (real cost ranges, real success rates, real time-to-fix), each with "Book a certified technician" CTA. Millions of long-tail pages no competitor can generate truthfully.

---

# PART 8: AI Capabilities

**Build order rule**: every AI feature must close its own data loop before scaling.

## 8.1 Diagnostic AI
- **v1 (now)**: Claude with a structured prompt over the knowledge-graph ontology — given device + symptom text (+ photos via vision), output ranked faults with confidence. Log *every* prediction → join against eventual actual diagnosis and outcome. **The logging is more important than the accuracy.**
- **v2**: RAG over RepairCases — retrieval grounds the LLM in real outcome data ("on 312 similar cases, fault was charging IC 71% of the time, median cost ₹650")
- **v3**: customer self-serve triage in the booking flow (photos + guided questions in vernacular) → pre-diagnosis attached to dispatch → technician arrives with the right parts → first-time-fix rate jumps
- **Audio/video diagnosis** (Phase 3): "upload a video of the noise your washing machine makes" — compressor vs. bearing vs. drum classifiable from audio; nobody in India does this

## 8.2 Cost Prediction
Gradient-boosted model over RepairCases: device × fault × city × part-grade → price band (P20–P80). Surfaces:
- **Consumer**: "Fair price: ₹600–900" on booking and on every SEO page (trust + conversion)
- **Platform**: quote-anomaly detection (the fraud feature from Part 4)
- **Technician**: instant-quote assist

## 8.3 Part Recommendation
Given diagnosis → BOM prediction from case history → real-time supplier availability/price → one-tap order. Captures parts GMV, completes the case-data loop, cuts repair turnaround (parts pre-ordered before technician visit for high-confidence diagnoses).

## 8.4 Technician Matching
Learning-to-rank over: skill-graph fit (FIELD_PROVEN > EXAM > claimed), trust score, distance/ETA, first-time-fix rate *on this fault class*, current load, acceptance prob, fairness floor (new verified technicians get guaranteed exposure or supply churns). Optimize for **completion-without-redo probability**, not acceptance speed — the metric IS the product strategy.

## 8.5 Repair Risk Prediction
Score every job at quote time: P(failure | device age, fault, part grade, technician). Powers:
- **Dynamic warranty pricing** → the protection-plan underwriting engine (this model is literally an insurance pricing engine)
- "Repair vs. replace" honesty advisor (short-term revenue loss, decade-long trust gain — and the "replace" path feeds recommerce)
- Technician guardrails: high-risk jobs require FIELD_VERIFIED+

---

# PART 9: Marketplace Economics

**Principle**: monetize the transaction lightly, monetize the ecosystem heavily. High take-rates on repair labor (Urban Company's ~25–30%) cause supply revolt — their technician protests are LocalTech's recruiting pitch. Win supply with low take, make money on everything *around* the repair.

## Revenue stack (in order of activation)

| # | Stream | Mechanics | Margin | Phase |
|---|---|---|---|---|
| 1 | **Marketplace commission** | 8–12% on serviced bookings (vs UC's 25–30%) — undercut as strategy | Med | 1–2 |
| 2 | **Lead fees** (shops) | Pay-per-qualified-lead for walk-in-style demand, ₹30–100 by category | High | 2 |
| 3 | **SaaS subscriptions** (shops) | Free CRM (data acquisition!) → Pro ₹999/mo → Business ₹2,999/mo. *The existing dashboard product becomes the free tier — a Trojan horse for repair-data capture from off-marketplace repairs* | Very high | 2 |
| 4 | **Technician subscriptions** | Free → Pro ₹299/mo (priority dispatch, instant payouts, insurance) | High | 2 |
| 5 | **Parts marketplace** | 3–5% on supplier GMV + fulfillment fees + supplier listing tiers | Med | 2 |
| 6 | **Protection plans** | Extended warranties ₹99–999, priced by the risk model (8.5); insurer-backed initially, own book later | Very high | 2–3 |
| 7 | **Academy** | Cert fees, B2B training, govt skilling programs | High | 3 |
| 8 | **Certified resale** | Inspection fees + recommerce take rate | Med | 3 |
| 9 | **B2B AMC contracts** | Annual maintenance for offices/PGs/societies — recurring, dense, predictable | Med | 2–3 |
| 10 | **Financial services** | Parts working-capital credit (NBFC partner, LocalTech underwrites on platform cash-flow data); technician insurance | Very high | 4 |
| 11 | **Data & embedded APIs** | OEM failure-rate intelligence; insurer repair-network APIs; white-label rails | Extreme | 4 |

## Supplier monetization detail
Catalog → shops order → LocalTech aggregates demand ("47 shops in Vijayawada need iPhone 13 displays this week") → suppliers bid/stock accordingly → commission + **promoted listings** + **demand-forecast data subscriptions**. Supplier credit terms to trusted shops, underwritten by LocalTech repair-volume data = stream #10's wedge.

## Unit economics target (Phase 2, per marketplace repair)
AOV ₹1,200 → commission (10%) ₹120 + parts attach (40% × ₹500 × 4%) ₹8 + protection attach (15% × ₹149 × 60% margin) ₹13 ≈ **₹140 revenue/repair**, payment + support costs ~₹35 → ~₹105 contribution. CAC payback in 2–3 repairs; everything depends on repeat rate, which depends on trust — which is why Parts 3–5 precede aggressive monetization.

---

# PART 10: Defensible Moats

## Why each incumbent can't follow

**RepairDesk (and shop CRMs)**: sells software to shops; no consumer demand, no technician identity, no transaction data across shops. Structurally a tools company — adding a marketplace would compete with its own customers. LocalTech's free-CRM tier attacks its revenue while harvesting the data RepairDesk never aggregates.

**Urban Company**: the obvious threat, and the most constrained. (1) Its model is *full-stack employment-like control* — high take rates, inventory-controlled supply. Re-platforming to an open credentialed ecosystem means cannibalizing its own P&L. (2) It's horizontal (beauty is its margin engine); deep technical verticals need skill infrastructure it has no DNA for. (3) It will never build a Device Passport because it doesn't think in devices, it thinks in service slots.

**JustDial/IndiaMART**: directories monetizing intent, not outcomes. No workflow, no warranty, no repair record. They sell the phone number; LocalTech owns what happens after the call. A directory cannot retro-fit trust.

**A new well-funded clone**: can copy every screen in months. Cannot copy: 500K outcome-labeled repair cases, 25K field-proven skill transcripts, 1M device passports, or a certification that shop signboards already display. **Time-based data moats are the only kind that survive funding asymmetry.**

## The moat stack (each reinforces the next)

1. **Outcome data moat** — warranty-verified repair cases; the only truthful training set for repair AI in India. *Compounds with GMV, can't be bought.*
2. **Credential moat** — when "LocalTech Certified" is what customers ask for and shops paint on signboards, the credential is a standard, and standards don't churn.
3. **Device passport moat** — cross-side lock-in through the *object*: the device's history lives on LocalTech regardless of which technician or owner; resale value enforces it.
4. **Knowledge moat** — vernacular, India-device-specific fault graph + the SEO surface generated from it; truthful long-tail content competitors cannot fabricate.
5. **Supply-economics moat** — Academy-driven acquisition (teach first, recruit second) gives structurally lower supply CAC than incentive-driven recruiting, forever.

## Network effects map
- **Cross-side classic**: customers ↔ technicians (per-city, must be rebuilt per geography — weakest)
- **Data network effect**: more repairs → smarter graph → better diagnosis/matching/pricing → better outcomes → more repairs (global, strongest)
- **Same-side supply**: technicians contribute knowledge → all technicians more capable → platform jobs preferable
- **Standard effect**: passport density → resale demand for passports → repair demand (cross-market)

## Growth loops (engineered, not hoped-for)
1. **SEO loop**: repair case → programmatic fix-page → organic booking → repair case
2. **Sticker loop**: every repaired device carries a QR sticker → household sees it → next breakage books direct
3. **Academy loop**: free course ads → certified technician → needs jobs → joins marketplace → success story content → more students
4. **Passport-resale loop**: repair → passport → certified resale → buyer registers → future repairs
5. **B2B density loop**: AMC contract → daily technician presence in a building → residents book personal repairs at marginal CAC ≈ 0
6. **WhatsApp referral loop**: post-repair receipt + warranty card shared on WhatsApp carries booking link + referral credit

---

# System Architecture & Schema Direction

**Keep the monolith.** Next.js + Postgres + Prisma to ~₹100Cr GMV. Add, in order: (1) an **event log table** now — every domain event appended from day one; it retro-feeds the trust engine, fraud detection, and ML training sets, and it's nearly free to add and impossible to backfill. (2) Redis + a job queue (BullMQ) for dispatch fan-out and WhatsApp delivery. (3) PostGIS + pgvector extensions. (4) Extract dispatch into a service only when latency demands it (Phase 3).

**Schema additions by phase**: Phase 1 — `Dispatch`, `Assignment`, `ServiceArea`, `Review`, `Warranty`, `WarrantyClaim`, `Payment`, `Event`, geo fields. Phase 2 — `Wallet`, `Payout`, `Subscription`, `PartListing`, `Order`, `ProtectionPlan`, `Skill`, `TechnicianSkill`, `PassportEvent`. Phase 3 — `RepairCase`, `Symptom`, `Fault`, `Solution` + edge tables, `Course/Exam/Certification`, `FraudFlag`.

**API surface additions** (representative): `POST /api/dispatch/:bookingId`, `POST /api/assignments/:id/accept`, `GET /api/track/:reference` (public), `POST /api/kyc/initiate`, `GET /api/technicians/:slug` (public profile), `POST /api/warranties/:id/claim`, `GET /api/passport/:code` (public), `POST /api/diagnose` (v2, logged), `GET /api/pricing/estimate`, `POST /api/parts/orders`, webhooks for Razorpay/WhatsApp/KYC providers.

---

# Execution Priorities — Monday Morning

1. **Close the loop**: dispatch engine + track page + WhatsApp notifications. The marketplace must exist before the ecosystem can.
2. **Add the `Event` log table** in the same sprint — the cheapest decision with the largest 10-year payoff.
3. **Pick one city, one category** (mobile repair — highest frequency, fastest feedback loops) and get to 100 repairs/week before touching anything in Phase 2.
4. **Start KYC verification immediately** even while supply is tiny — "every technician background-verified" is the launch story, and retrofitting verification onto existing supply is a churn event.
5. **Instrument the AI mock today**: log every diagnosis request and eventual outcome. Year-3 LocalTech will thank year-0 LocalTech for every labeled row.

**The one-sentence strategy: subsidize the repair transaction to harvest identity, device, and knowledge data — then monetize trust, not labor.**
