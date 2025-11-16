# 📰 Mtaa News - Hyperlocal AI-Powered News Platform

**Tagline**: Your neighborhood, your news

AI-powered hyperlocal news platform connecting communities across Africa with verified local news, citizen journalism, and community engagement.

## 🌟 Key Features

### 📍 Hyperlocal News
- AI-aggregated news from multiple sources
- Location-based content (estate/neighborhood level)
- Real-time news updates
- Multiple languages (English, Swahili)

### 👥 Citizen Journalism
- User-submitted news and stories
- Photo/video uploads
- Verification pipeline
- Reputation system for reporters

### ✅ AI Verification
- Fake news detection
- Source credibility scoring
- Fact-checking pipeline
- Content moderation

### 🏢 Local Business Directory
- Business listings and profiles
- Sponsored content
- Local classifieds
- Event listings

### 📱 Multi-Channel Distribution
- Web platform
- WhatsApp news updates
- SMS alerts (optional)
- Mobile PWA

### 🎯 Community Features
- Discussion forums
- Polls and surveys
- Emergency alerts
- Lost & found

## 🏗️ Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Mapbox (location features)

### Backend
- Hono (Cloudflare Workers)
- PostgreSQL (Neon)
- Redis (caching)
- Cloudflare R2 (media storage)

### AI & ML
- Claude 3.5 (content aggregation)
- GPT-4 (fact-checking)
- Content moderation API
- Image recognition

### Infrastructure
- Vercel (Frontend)
- Cloudflare Workers (API)
- Neon (Database)
- Resend (Email notifications)
- WhatsApp Business API

## 📊 Project Structure

```
local-news-platform/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Hono API (Cloudflare Workers)
├── packages/
│   ├── database/         # Drizzle ORM + schema
│   ├── ui/              # Shared React components
│   ├── ai-verification/ # AI fact-checking
│   ├── news-aggregator/ # Content aggregation
│   └── notifications/   # WhatsApp/Email/SMS
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL database (Neon)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Seed with sample data
pnpm db:seed

# Start development servers
pnpm dev
```

Access:
- Web: http://localhost:3000
- API: http://localhost:8787

## 🔐 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Maps
MAPBOX_ACCESS_TOKEN=...

# WhatsApp
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

# Storage
CLOUDFLARE_ACCOUNT_ID=...
R2_BUCKET_NAME=...
R2_ACCESS_KEY=...
R2_SECRET_KEY=...

# Notifications
RESEND_API_KEY=...

# Auth
BETTER_AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## 🎯 Core Features

### For Readers
- Browse local news by location
- Subscribe to specific neighborhoods
- Receive WhatsApp news updates
- Report suspicious content
- Engage in community discussions

### For Citizen Journalists
- Submit news stories
- Upload photos and videos
- Build reputation score
- Earn recognition badges
- Get featured on homepage

### For Local Businesses
- Create business profile
- Post sponsored content
- List events and offers
- Reach local audience
- Analytics dashboard

### For Administrators
- Content moderation dashboard
- Verify user submissions
- Manage locations
- Analytics and insights
- User management

## 📈 Revenue Model

### B2C (Free/Premium)
- Free: Basic news access
- Premium: Ad-free, early access, exclusive content

### B2B
- Local businesses: Sponsored content, listings
- County governments: Official announcements
- NGOs: Community outreach campaigns

### Advertising
- Local business ads
- Targeted by location
- Cost-per-click model

## 🛠️ Development

### Run tests
```bash
pnpm test
```

### Build for production
```bash
pnpm build
```

### Deploy
```bash
# Frontend to Vercel
vercel --prod

# API to Cloudflare Workers
cd apps/api && wrangler deploy
```

## 📱 User Journeys

### Reader Journey
1. Visit website or receive WhatsApp message
2. Select their neighborhood
3. Browse local news
4. Subscribe for updates
5. Engage with community

### Citizen Journalist Journey
1. Sign up as reporter
2. Submit story with photos
3. AI verification check
4. Admin review
5. Story published
6. Build reputation

### Business Journey
1. Create business profile
2. Post sponsored content
3. Target local audience
4. Track engagement
5. Renew subscription

## 🌍 Expansion Plan

### Phase 1: Nairobi Pilot (Months 1-3)
- Launch in 5 estates
- 10,000 users target
- 50 local businesses

### Phase 2: Nairobi Expansion (Months 4-6)
- Expand to 20 estates
- 50,000 users
- 200 businesses

### Phase 3: Kenya Expansion (Months 7-12)
- Launch in Mombasa, Kisumu, Nakuru
- 200,000 users
- 1,000 businesses

### Phase 4: Regional (Year 2)
- Uganda, Tanzania, Rwanda
- 1M+ users
- Multi-language support

## 🏆 Unique Selling Points

1. **Hyperlocal Focus**: Estate-level granularity
2. **AI Verification**: Fight fake news
3. **Citizen Journalism**: Community-driven content
4. **Multi-Channel**: Web + WhatsApp + SMS
5. **Local Business**: Connect community with commerce
6. **Emergency Alerts**: Critical community information

## 📊 Success Metrics

- Monthly Active Users (MAU)
- News submissions per day
- Verification accuracy
- Business listings
- User engagement rate
- Revenue per user

## 🤝 Contributing

This is a commercial project. For collaboration inquiries, contact the team.

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for African communities** 🌍
