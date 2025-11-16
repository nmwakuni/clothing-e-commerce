# Mteja - LinkedIn Client Acquisition Platform

**AI-powered LinkedIn profile optimizer and outreach assistant for African professionals.**

Mteja helps freelancers, consultants, and agencies in Africa get more clients from LinkedIn through:
- **FREE Profile Optimizer**: AI-powered feedback to improve your LinkedIn profile
- **AI Outreach Assistant**: Generate personalized connection requests and cold emails at scale
- **Simple CRM**: Track prospects, manage follow-ups, and analyze performance
- **African Payments**: Pay with M-Pesa, Pesapal, or cards in local currencies

---

## Features

### 🎯 Profile Optimizer (FREE Forever)
- AI analysis of your LinkedIn profile
- Score your headline, about section, and experience (0-100)
- Get specific suggestions to attract more clients
- Before/after comparison
- Industry-specific templates

### 🤖 AI Outreach Assistant (Paid)
- Research prospects from LinkedIn URLs
- AI analyzes profiles to identify pain points and interests
- Generate personalized messages:
  - Connection requests
  - 3-message follow-up sequence
  - Cold email with subject line
- Copy-paste ready messages
- Built-in personalization using prospect data

### 📊 Simple CRM
- Track all prospects in one place
- Mark status (new, contacted, responded, qualified, closed)
- Schedule follow-ups
- Analyze response rates
- Filter by tags and lists

### 💳 African-Friendly Payments
- **M-Pesa**: Direct payments for Kenya
- **Pesapal**: Cards, M-Pesa, Airtel Money for East Africa
- Multi-currency support: KES, UGX, TZS, NGN, GHS
- Affordable pricing (KSh 2,900/mo vs $99+ Western tools)

---

## Tech Stack

### Monorepo Structure
```
mteja/
├── apps/
│   ├── web/          # Next.js 15 web app
│   └── api/          # Hono API (optional)
└── packages/
    ├── database/     # Drizzle ORM + PostgreSQL schemas
    ├── ai-engine/    # Claude AI integration
    ├── linkedin-scraper/  # Puppeteer scraping
    ├── payments/     # M-Pesa + Pesapal integration
    └── ui/           # Shared UI components
```

### Technologies
- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Server Actions
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **AI**: Anthropic Claude 3.5 Sonnet
- **Scraping**: Puppeteer
- **Auth**: Clerk
- **Payments**: M-Pesa API, Pesapal API
- **Monorepo**: pnpm workspaces + Turborepo
- **Deployment**: Vercel (frontend), Neon (database)

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
```bash
cd mteja
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**

Copy `.env.local.example` to `.env.local` in `apps/web/`:
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Fill in your credentials:
```env
# Database
DATABASE_URL=your_neon_database_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Anthropic AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# M-Pesa (Kenya)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_mpesa_short_code
MPESA_PASSKEY=your_mpesa_passkey
MPESA_ENVIRONMENT=sandbox

# Pesapal (East Africa)
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
PESAPAL_ENVIRONMENT=sandbox
PESAPAL_IPN_URL=your_ipn_callback_url

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Generate database migrations**
```bash
pnpm db:generate
```

5. **Run database migrations**
```bash
pnpm db:migrate
```

6. **Start development server**
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Development

### Available Scripts

**Root level:**
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm type-check` - Type check all TypeScript
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio

**Web app** (`apps/web`):
- `pnpm dev` - Start Next.js dev server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Database Schema

**Core Tables:**
- `users` - User accounts and subscriptions
- `profiles` - LinkedIn profile audits and optimizations
- `prospects` - Researched prospects
- `outreach_messages` - Generated messages
- `templates` - Message templates
- `payments` - Payment transactions
- `subscriptions` - Active subscriptions
- `analytics` - Usage metrics

---

## Pricing

### Free Tier
- ✅ Unlimited profile audits
- ❌ No prospect research
- ❌ No outreach generation

### Starter - KSh 2,900/mo (~$29 USD)
- ✅ Unlimited profile audits
- ✅ 50 prospect researches/month
- ✅ 150 outreach messages/month
- ✅ Analytics & tracking
- ✅ All templates

### Pro - KSh 7,900/mo (~$79 USD)
- ✅ Everything in Starter
- ✅ 200 prospect researches/month
- ✅ 600 outreach messages/month
- ✅ Priority support
- ✅ Custom branding
- ✅ 3 team seats

### Agency - KSh 19,900/mo (~$199 USD)
- ✅ Everything in Pro
- ✅ Unlimited prospects & messages
- ✅ API access
- ✅ 10 team seats
- ✅ White-label options

---

## Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Import project from GitHub
- Select `apps/web` as root directory
- Add environment variables
- Deploy

3. **Setup Database**
- Create Neon database
- Add `DATABASE_URL` to Vercel environment variables
- Run migrations from Vercel CLI or dashboard

### Environment Variables
Make sure to add all environment variables from `.env.local.example` to your Vercel project settings.

---

## Contributing

This is a private project, but contributions from the team are welcome:

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

---

## API Keys Setup

### Anthropic Claude
1. Get API key from [Anthropic Console](https://console.anthropic.com)
2. Add to `ANTHROPIC_API_KEY`

### Clerk (Authentication)
1. Create account at [Clerk.com](https://clerk.com)
2. Create application
3. Copy publishable and secret keys

### M-Pesa (Kenya)
1. Register at [Safaricom Daraja](https://developer.safaricom.co.ke)
2. Create app
3. Get consumer key, secret, and passkey
4. Register callback URL

### Pesapal (East Africa)
1. Register at [Pesapal](https://www.pesapal.com)
2. Get API credentials
3. Register IPN URL
4. Support: cards, M-Pesa, Airtel Money, bank transfers

### Neon (Database)
1. Create account at [Neon.tech](https://neon.tech)
2. Create project
3. Copy connection string

---

## License

Proprietary - All rights reserved

---

## Support

For support, email: support@mteja.africa

---

**Built with ❤️ for African professionals**
