# DeviceDNA Development Guide

## Project Overview
DeviceDNA is an AI-powered mobile repair intelligence platform with a premium, futuristic design (inspired by Apple, Tesla, Linear, Stripe, Arc Browser).

**Key Design Principle**: Dark graphite + electric green + glassmorphism + smooth micro-interactions.

## Completed Foundation (Phase 1)
- ✅ Next.js 16 + TypeScript + Tailwind CSS 4 setup
- ✅ Complete design system with animations
- ✅ Marketing website with 8 key sections
- ✅ Dashboard scaffolding for all 4 user roles
- ✅ PostgreSQL schema (20+ core modules)
- ✅ API route structure (auth, devices, repairs, AI diagnosis)

## Current State
- Landing page is fully functional with responsive design
- Dashboard pages have KPI cards and layout structure (no data integration yet)
- API endpoints have validation but aren't connected to database (Prisma client not initialized)
- Database schema is defined but not yet pushed to PostgreSQL

## Next Priorities (Phase 2)

### 1. Database Integration
- [ ] Set up PostgreSQL database (local dev + cloud for staging)
- [ ] Run `npm run db:push` to create tables
- [ ] Seed initial data (sample shops, technicians, repairs)
- [ ] Connect Prisma client to API routes

### 2. Authentication
- [ ] Implement JWT-based auth in `/api/auth/*`
- [ ] Add middleware for route protection
- [ ] Session management for dashboard access
- [ ] Password reset flow

### 3. Core Workflows
- [ ] Repair creation → status tracking → completion
- [ ] Invoice generation with GST calculation
- [ ] Device health calculation and updates
- [ ] Technician job assignment and tracking

### 4. Data Visualization
- [ ] Dashboard KPI cards pulling real data
- [ ] Recent repairs list with live updates
- [ ] Performance charts (technician, shop revenue, etc.)
- [ ] Device health visualization

## Design System Notes
- Colors in Tailwind config: `graphite-*` and `accent-*`
- All interactive elements use `glass` class for consistency
- Animations defined in globals.css (fade-in, slide-up, float, glow)
- Breakpoints: mobile-first responsive with md/lg breakpoints
- Typography: Inter for body, Space Mono for headings

## Key Files Reference
- **Design tokens**: `tailwind.config.ts` + `app/globals.css`
- **Database models**: `prisma/schema.prisma`
- **API structure**: `app/api/` (organized by feature)
- **Components**: `components/` (reusable, modular)
- **Pages**: `app/dashboard/` (user role specific)

## Deployment Notes
- Deploy to VPS using `./deploy.sh` (from user's deploy script memory)
- Environment variables: copy `.env.example` to `.env.local` for local dev
- Database: PostgreSQL required (not SQLite)
- Build: `npm run build` → `npm run start`

## Important Constraints
- No blue-and-white SaaS styling (already avoided ✅)
- Premium, futuristic aesthetic maintained throughout
- Glassmorphism on all glass containers
- Electric green (#22c55e) for all CTAs and highlights
- Smooth animations and micro-interactions (no jarring transitions)

## Code Style
- TypeScript strict mode enabled
- Zod for API validation
- Next.js App Router (not Pages Router)
- React functional components + hooks
- Tailwind CSS for all styling (no CSS-in-JS)
- "use client" only where needed (Navigation, interactive components)

## Testing the Build Locally
```bash
npm install       # Install deps
npm run build     # Build for production
npm run start     # Start production server
# Visit http://localhost:3000
```

## GitHub Repository
Repository: `vjrid4/localtech`
All commits should follow conventional commit format.
