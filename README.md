# DeviceDNA - AI-Powered Mobile Repair Intelligence Platform

> The future of mobile device management. Every device deserves a digital identity.

## 🚀 Overview

DeviceDNA is a comprehensive, AI-powered platform that transforms mobile repair from a simple service into an intelligent ecosystem. Every device gets a digital identity, complete repair history, health passport, predictive intelligence, and warranty management.

### Core Vision
- **Device Digital Identity**: Unique fingerprint and complete lifecycle tracking for every device
- **Repair Intelligence Engine**: AI-powered diagnostics and predictive failure analysis
- **Multi-Role Ecosystem**: Seamless integration for repair shops, technicians, customers, and suppliers
- **Knowledge Universe**: Crowdsourced schematics library, hardware solutions, and training academy
- **Premium Experience**: Category-defining platform with Apple/Tesla/Linear-level design and UX

## 📦 What's Included

### 1. **Marketing Website**
- Cinematic hero section with animated gradients
- Device journey timeline
- Repair intelligence engine showcase
- Knowledge universe visualization
- Multi-role ecosystem overview
- Pricing tiers (Starter, Professional, Enterprise)
- Premium glassmorphism design system
- Fully responsive mobile layouts

### 2. **Core Modules** (20 Feature Areas)
- Repair Shop ERP
- Multi-Branch Management
- Inventory & Spare Parts
- Technician Management
- GST Billing System
- WhatsApp Automation
- Customer App
- Technician App
- Supplier Marketplace
- Device Health Passport
- AI Repair Assistant
- Schematics & Boardviews Library
- Hardware Solutions Database
- Refurbished Device Certification
- Predictive Failure Analysis
- AI Parts Forecasting
- Community Knowledge Base
- Training & Certification Academy
- Digital Warranty Management
- Device Resale Verification

### 3. **Dashboard UIs**
- Repair Shop Owner Dashboard
- Technician Workspace
- Customer Portal
- Supplier Marketplace

### 4. **Backend Architecture**
- Next.js 16 with App Router
- PostgreSQL Database (Prisma ORM)
- REST API structure
- Authentication endpoints
- Device management APIs
- Repair workflow APIs
- AI diagnosis endpoints
- WhatsApp integration ready

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Styling**: Custom design system with glassmorphism, electric green accents
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Security**: JWT, bcryptjs for password hashing
- **Validation**: Zod for schema validation
- **AI Ready**: OpenAI/Claude integration points

## 🎨 Design System

### Colors
- **Background**: Dark graphite (#0a0a0a to #303030)
- **Accent**: Electric green (#22c55e)
- **Glass**: Semi-transparent overlays with backdrop blur
- **Typography**: Inter (body) + Space Mono (display)

### Components
- Glassmorphism containers
- Gradient text effects
- Smooth micro-interactions
- Cinematic animations
- Responsive grid layouts
- Premium spacing system

## 📊 Database Schema

Complete Prisma schema with models for:
- Users (Admin, Shop Owner, Technician, Customer, Supplier)
- Organizations (Repair Shops, Branches)
- Devices & Device Health
- Repairs & Estimates
- Invoices & Billing
- Inventory & Spare Parts
- Warranties
- WhatsApp Integration
- Knowledge Base

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Push schema to database (requires DATABASE_URL)
npm run db:push
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Production build
npm run build

# Start production server
npm run start
```

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles & animations
│   ├── dashboard/            # Dashboard pages
│   │   ├── page.tsx
│   │   ├── shop/
│   │   ├── customer/
│   │   ├── technician/
│   │   └── supplier/
│   └── api/                  # API routes
│       ├── auth/
│       ├── devices/
│       ├── repairs/
│       ├── device-health/
│       └── ai/
├── components/               # Reusable React components
│   ├── Navigation.tsx
│   ├── Hero.tsx
│   ├── DeviceTimeline.tsx
│   ├── RepairIntelligence.tsx
│   ├── KnowledgeUniverse.tsx
│   ├── MultiRoleEcosystem.tsx
│   ├── Pricing.tsx
│   ├── CTA.tsx
│   └── Footer.tsx
├── lib/                      # Utility functions & database
│   ├── db/                   # Database utilities
│   └── api/                  # API utilities
├── prisma/                   # Database schema
│   └── schema.prisma
├── public/                   # Static assets
├── styles/                   # Additional styles
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── next.config.ts            # Next.js configuration
└── package.json
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Devices
- `GET /api/devices?customerId=xyz` - List devices
- `POST /api/devices` - Create device
- `GET /api/devices/:id` - Get device details

### Device Health
- `GET /api/device-health/:deviceId` - Get health passport
- `PATCH /api/device-health/:deviceId` - Update health data

### Repairs
- `GET /api/repairs?repairShopId=xyz` - List repairs
- `POST /api/repairs` - Create repair
- `GET /api/repairs/:id` - Get repair details
- `PATCH /api/repairs/:id` - Update repair status

### AI Diagnosis
- `POST /api/ai/diagnose` - AI-powered diagnostics

## 🎯 Next Steps

### Phase 1 - Foundation ✓
- [x] Project setup & structure
- [x] Design system implementation
- [x] Landing page with hero & sections
- [x] Database schema design
- [x] Basic API routes
- [x] Dashboard scaffolding

### Phase 2 - Core Features
- [ ] Authentication system
- [ ] Database integration (Prisma client)
- [ ] Repair management workflows
- [ ] Device health tracking
- [ ] Inventory management
- [ ] GST billing system

### Phase 3 - Intelligence
- [ ] AI diagnostic engine integration
- [ ] Predictive failure analysis
- [ ] Parts forecasting ML model
- [ ] Smart scheduling algorithms
- [ ] Knowledge base search

### Phase 4 - Integrations
- [ ] WhatsApp Business API integration
- [ ] Payment gateway (Stripe/Razorpay)
- [ ] SMS notifications
- [ ] Email notifications
- [ ] File upload (AWS S3)

### Phase 5 - Mobile Apps
- [ ] Customer mobile app (React Native)
- [ ] Technician mobile app (React Native)
- [ ] Supplier mobile app (React Native)

### Phase 6 - Launch
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Load testing
- [ ] Beta testing program
- [ ] Production deployment

## 🔐 Environment Variables

See `.env.example` for required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `WHATSAPP_API_KEY` - WhatsApp Business API key
- `OPENAI_API_KEY` - OpenAI API key for diagnostics
- `AWS_*` - AWS credentials for file uploads

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is the MVP foundation of DeviceDNA. Future contributions welcome.

---

**Built with premium design principles inspired by Apple, Tesla, Linear, Stripe, and Arc Browser.**
