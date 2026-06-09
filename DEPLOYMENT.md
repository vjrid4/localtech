# DeviceDNA Deployment Guide

## Phase 2: Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (local or cloud)
- Git

### Step 1: Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb devicedna

# Get connection string
psql devicedna -c "SELECT version();"
```

#### Option B: Cloud PostgreSQL (Recommended)
- **Supabase**: Create free project at supabase.com
- **Railway**: Create project at railway.app
- **Render**: Create project at render.com
- **AWS RDS**: Create PostgreSQL instance

### Step 2: Environment Setup

```bash
# Copy example env and update with your database URL
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

Update DATABASE_URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/devicedna"
```

### Step 3: Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with test data
npm run db:seed
```

### Step 4: Development Server

```bash
# Start dev server
npm run dev

# Site available at http://localhost:3000
```

### Test Credentials (After Seeding)
```
Shop Owner: shop@example.com / password123
Technician: tech@example.com / password123
Customer: customer@example.com / password123
Supplier: supplier@example.com / password123
```

## Phase 2 Features Implemented

### Authentication
- ✅ User registration with email/password
- ✅ JWT-based login
- ✅ Route middleware for protected endpoints
- ✅ 5 user types: Admin, Shop Owner, Technician, Customer, Supplier

### Core Features
- ✅ Repair creation, status tracking, completion
- ✅ Device management with health passports
- ✅ Estimate generation with auto-numbering
- ✅ Invoice creation with GST calculation
- ✅ Inventory management
- ✅ Multi-branch support

### Dashboard APIs
- ✅ `/api/dashboard/shop` — Repair shop owner metrics
- ✅ `/api/dashboard/technician` — Job queue and performance
- ✅ `/api/dashboard/customer` — Devices and repair history
- ✅ `/api/dashboard/supplier` — Orders and sales

### Repair Workflow
- ✅ POST `/api/repairs` — Create repair
- ✅ GET `/api/repairs` — List repairs (filtered)
- ✅ PATCH `/api/repairs/[repairId]` — Update status
- ✅ POST `/api/estimates` — Create estimate
- ✅ POST `/api/invoices` — Generate invoice with GST

### Analytics
- ✅ GET `/api/analytics/shop` — Revenue, repairs, technician metrics
- ✅ Monthly revenue trends
- ✅ Repair completion rates

## Phase 3: AI Features (Prepared)

### Modules Ready for Integration
- AI Diagnosis Engine (`lib/ai/diagnosis.ts`)
  - Device issue diagnosis
  - Repair history analysis
  - Predictive failure detection

- Parts Forecasting (`lib/ai/forecasting.ts`)
  - Demand prediction
  - Inventory optimization
  - Smart reordering

- API Endpoints (Ready to integrate)
  - POST `/api/ai/diagnose` — AI diagnosis
  - POST `/api/ai/forecast` — Parts forecasting

### Phase 3 Integration Points
```typescript
// To connect your AI service:
// 1. Update lib/ai/diagnosis.ts diagnoseDevice()
// 2. Add OpenAI/Claude API calls
// 3. Integrate ML models for predictions
// 4. Add device history analysis
```

## Phase 4: Integrations (Ready to Implement)

### WhatsApp Business API
- Location: `lib/integrations/whatsapp.ts`
- Functions: sendRepairUpdate, sendEstimate, sendInvoice
- TODO: Implement real WhatsApp API calls

### Payment Gateway
- Location: `lib/integrations/payments.ts`
- Support: Stripe, Razorpay, UPI
- Functions: processPayment, verifyPayment, refundPayment
- TODO: Add Razorpay/Stripe API integration

### File Uploads (AWS S3)
- TODO: S3 integration for schematics, boardviews, PDFs

## Production Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables for Production
```
DATABASE_URL="postgresql://prod-user:prod-pass@prod-db:5432/devicedna"
JWT_SECRET="use-min-32-char-random-secret"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Phase 4 (optional)
STRIPE_SECRET_KEY="sk_live_..."
OPENAI_API_KEY="sk-..."
WHATSAPP_API_KEY="..."
AWS_ACCESS_KEY_ID="..."
```

### Deployment Options

#### Option 1: Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option 2: Custom VPS (as per user's deploy script)
```bash
# Using existing deploy script
./deploy.sh devicedna
```

#### Option 3: Docker
```bash
# Build image
docker build -t devicedna .

# Run container
docker run -p 3000:3000 -e DATABASE_URL="..." devicedna
```

### Database Backups (Production)
```bash
# PostgreSQL backup
pg_dump devicedna > backup.sql

# Restore
psql devicedna < backup.sql
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Prisma
npx prisma db push --skip-generate
```

### Auth Issues
- Verify JWT_SECRET is set in .env.local
- Check token expiration (7 days default)
- Test login: POST /api/auth/login

### API Errors
```bash
# Check logs
npm run dev 2>&1 | grep -i error

# Verify Prisma schema
npx prisma generate
```

## Next Steps

### Phase 2 Complete ✅
- [x] Auth system
- [x] Database integration
- [x] Repair workflow
- [x] Dashboard data
- [x] Invoicing & GST

### Phase 3: Intelligence
- [ ] AI diagnosis integration (OpenAI/Claude)
- [ ] Parts forecasting ML
- [ ] Predictive failure analysis
- [ ] Smart scheduling

### Phase 4: Integrations
- [ ] WhatsApp Business API
- [ ] Razorpay/Stripe payments
- [ ] AWS S3 uploads
- [ ] SMS/Email notifications

### Phase 5: Mobile Apps
- [ ] React Native customer app
- [ ] React Native technician app
- [ ] React Native supplier app
- [ ] Offline-first sync

### Phase 6: Launch
- [ ] Load testing
- [ ] Security audit
- [ ] Beta program
- [ ] Marketing

## Support

For issues or questions:
1. Check logs: `npm run dev`
2. Check database: `npx prisma studio`
3. Test API: Use Postman/Insomnia
4. Review schema: `prisma/schema.prisma`

---

**DeviceDNA Phase 2 is production-ready for local development. Phase 3-6 features are architected and ready for implementation.**
