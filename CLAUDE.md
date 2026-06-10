# LocalTech Development Guide

## Project Overview
LocalTech is a consumer repair marketplace platform — connecting customers with verified technicians and service centers for mobiles, TVs, appliances, laptops, CCTV and solar systems across India.

**Consumer brand**: LocalTech (localtech.in)  
**Internal SaaS name**: DeviceDNA (used in DB, env vars, code)  
**Design**: Modern 2026 — Plus Jakarta Sans, green-500 CTAs, warm grays, glassmorphism for dashboards

---

## Architecture

### Tech Stack
- Next.js 16.2.7 + TypeScript strict mode + Tailwind CSS v4
- PostgreSQL `devicedna` DB · Prisma v5 ORM
- JWT auth (`jsonwebtoken@^8.5.1`) · bcryptjs for password hashing
- Recharts for dashboard charts
- React 19 · App Router (not Pages Router)

### Database
- **Local dev**: `DATABASE_URL="postgresql://jana@localhost:5432/devicedna"` (socket auth, no password)
- **Push schema**: `DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d'"' -f2) npx prisma db push`
- **Generate client**: `npx prisma generate`

### Auth
- JWT stored in localStorage (`devicedna_token`, `devicedna_user`)
- `lib/auth/jwt.ts` — `createToken` / `verifyToken`
- `lib/auth/middleware.ts` — `authenticateToken(request)` → `{authenticated, user, error}`
- `lib/auth/client.ts` — `apiGet`, `apiPost`, `apiPatch`, `getToken`, `setToken`, `getUser`
- Password reset: JWT with `purpose: "password-reset"`, 1h expiry (no email in dev — logs to console)

### Roles
`ADMIN | REPAIR_SHOP_OWNER | TECHNICIAN | CUSTOMER | SUPPLIER`

### Repair Status Flow
`RECEIVED → DIAGNOSED → QUOTED → APPROVED → IN_PROGRESS → COMPLETED → DELIVERED`  
(plus `CANCELLED` from most states)

---

## What's Built

### Consumer Platform
- `/` — Full 9-section homepage (hero, how-it-works, categories, trust, technicians, service-centers, AI diagnostics, testimonials, CTA)
- `/book` — Public 3-step booking wizard (no login): device type → describe issue → contact info → reference number
- `/book/success` — Booking confirmation with reference
- `/mobiles`, `/tv`, `/laptops`, `/appliances`, `/cctv`, `/solar` — Category pages
- `/login`, `/register`, `/forgot-password`, `/reset-password` — Auth pages
- `components/LocalTechNav.tsx` — Transparent-on-hero / white-on-scroll nav

### Shop Owner Dashboard (`/dashboard/shop/*`)
- Overview with live KPIs + revenue chart (Recharts)
- Repairs table with StatusUpdateDrawer + EstimateDrawer per row
- New Repair wizard (4 steps): customer search/create → device → details with AI diagnosis → review
- Analytics, Inventory, Technicians, Billing sub-pages
- Billing: "Ready to Invoice" panel + GST invoice generation modal

### Technician Dashboard (`/dashboard/technician`)
- Job queue with priority grouping and StatusUpdateDrawer
- Knowledge base page

### Customer Dashboard (`/dashboard/customer`)
- Devices with health score badges (green/amber/red)
- Repair history

### Supplier Dashboard (`/dashboard/supplier`)
- Overview + Orders sub-page

---

## Key API Routes

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/auth/login` | — | Login, returns JWT |
| `POST /api/auth/register` | — | Customer self-registration |
| `GET /api/auth/me` | JWT | Session validation |
| `POST /api/auth/forgot-password` | — | Generate reset token (logged to console in dev) |
| `POST /api/auth/reset-password` | — | Validate JWT token, update password |
| `POST /api/book` | — | Public booking request (no auth) |
| `POST /api/leads/business` | — | Business / technician enquiry |
| `GET/POST /api/repairs` | JWT | List/create repairs. `?uninvoiced=1` for billing |
| `PATCH /api/repairs/[id]` | JWT | Status updates |
| `GET/POST /api/customers` | JWT | Search/create customers |
| `GET/POST /api/devices` | JWT | List/add devices |
| `GET/POST /api/estimates` | JWT | Estimates (supports `repairId` path) |
| `GET/POST /api/invoices` | JWT | Invoices with GST |
| `GET /api/inventory` | JWT | Spare parts inventory |
| `POST /api/ai/diagnose` | JWT | AI fault diagnosis (mock — wire Anthropic API) |
| `GET /api/dashboard/shop` | JWT | Shop KPIs |
| `GET /api/dashboard/technician` | JWT | Technician job queue |
| `GET /api/dashboard/customer` | JWT | Customer devices + health scores |
| `GET /api/device-health/[id]` | — | Device health passport (stub — returns mock) |

---

## AI Diagnosis

`lib/ai/diagnosis.ts` currently returns a mock. To enable real AI:

```typescript
// Replace diagnoseDevice() with Anthropic API call:
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
```

Add `ANTHROPIC_API_KEY` to `.env.local` to activate.

---

## Running Locally

```bash
npm install
cp .env.example .env.local   # then edit DATABASE_URL + JWT_SECRET
npm run dev                  # http://localhost:3000
```

Demo accounts (password: `password123`):
- `shop@example.com` — Shop Owner
- `tech@example.com` — Technician
- `customer@example.com` — Customer
- `supplier@example.com` — Supplier

---

## Deployment

```bash
./deploy.sh localtech        # zero-downtime blue-green deploy on VPS
```

- Copies `.env.local` → container as `.env`
- Runs `npm run build` inside Docker
- PostgreSQL must be running on host, accessible via socket or TCP
- Set `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL` in production env

## GitHub Repository
`vjrid4/localtech` — all commits follow conventional commit format.

---

## Remaining / Future Work
- Wire real Anthropic/OpenAI API key for AI diagnosis
- Email delivery for password reset (SMTP or transactional email)
- WhatsApp status update notifications to customers
- Device health score calculation from repair history (currently returns mock)
- Admin panel for managing business leads and booking requests
- Customer-facing repair tracking by reference number
- Payment integration (Razorpay / UPI)
