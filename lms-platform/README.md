# 🎓 LMS Platform - SkillHub Africa

AI-Powered Learning Management System for comprehensive education via WhatsApp, Web, and Mobile.

## 🏗️ Architecture

```
lms-platform/
├── apps/
│   ├── web/                    # Next.js 14 web application
│   │   ├── app/               # App router
│   │   ├── components/        # React components
│   │   └── lib/               # Utilities
│   └── api/                   # Hono API server
│       ├── routes/            # API endpoints
│       ├── middleware/        # Auth, validation, etc.
│       └── services/          # Business logic
├── packages/
│   ├── database/              # Neon PostgreSQL + Drizzle ORM
│   │   ├── schema/           # Database schema
│   │   └── migrations/       # DB migrations
│   ├── ai-tutor/             # AI tutoring engine
│   │   ├── prompts/          # System prompts
│   │   ├── rag/              # RAG for course content
│   │   └── adapters/         # LLM adapters (Claude, GPT-4)
│   ├── ui/                   # Shared UI components
│   └── config/               # Shared configuration
└── docs/
    ├── DATABASE_SCHEMA.md    # Database documentation
    ├── API_SPEC.md           # API specification
    └── DEPLOYMENT.md         # Deployment guide
```

## 🎯 Key Features

### For Learners
- ✅ AI tutor (24/7 personalized teaching via WhatsApp)
- ✅ Interactive courses (learn by doing)
- ✅ Progress tracking & analytics
- ✅ Blockchain-verified certificates
- ✅ Job placement integration
- ✅ Mobile-first (WhatsApp, PWA)

### For Course Creators
- ✅ Course creation studio
- ✅ AI-assisted content generation
- ✅ Revenue sharing (70/30 split)
- ✅ Student analytics
- ✅ Automated assessments

### For Businesses (B2B)
- ✅ Employee training platform
- ✅ White-label option
- ✅ Custom courses
- ✅ Compliance tracking
- ✅ Progress dashboards

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Backend
- **API**: Hono (Cloudflare Workers / Node.js)
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Cache**: Redis (Upstash)
- **Queue**: BullMQ (background jobs)

### AI/ML
- **LLM**: Anthropic Claude / OpenAI GPT-4
- **Vector DB**: Pinecone (for RAG)
- **Embeddings**: OpenAI text-embedding-3
- **Code Execution**: Judge0 API

### Integrations
- **WhatsApp**: Meta Business API
- **Payments**: M-Pesa (Safaricom Daraja API)
- **SMS**: Africa's Talking
- **Video**: Cloudflare Stream
- **Storage**: Cloudflare R2

## 📊 Database Schema Overview

### Core Tables
- `users` - User accounts (learners, creators, admins)
- `courses` - Course metadata
- `lessons` - Individual lessons within courses
- `enrollments` - User course enrollments
- `progress` - Learning progress tracking
- `assessments` - Quizzes and tests
- `submissions` - Student submissions
- `certificates` - Issued certificates
- `payments` - Transaction records
- `subscriptions` - Premium subscriptions

### AI/Interaction
- `conversations` - WhatsApp chat history
- `ai_sessions` - AI tutoring sessions
- `feedback` - Student feedback on lessons

### Marketplace
- `creators` - Course creator profiles
- `payouts` - Creator earnings
- `reviews` - Course reviews

See [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for full schema.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Neon database account
- Cloudflare account (for Workers)

### Environment Variables

Create `.env.local` files:

**apps/web/.env.local**:
```bash
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_WS_URL=ws://localhost:8787
```

**apps/api/.env**:
```bash
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
REDIS_URL=...
```

### Installation

```bash
# Install dependencies
pnpm install

# Set up database
cd packages/database
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed initial data

# Start development servers
pnpm dev          # Starts all apps (web + api)
```

## 📱 WhatsApp Bot Flow

### Onboarding
```
User: Hi

Bot: Welcome to SkillHub Africa! 🎓

I'm your AI learning assistant. I can help you:
✅ Learn new skills (coding, design, business)
✅ Answer questions 24/7
✅ Track your progress
✅ Get certified

What do you want to learn today?

[Browse Courses] [Continue Learning] [Help]
```

### Learning Flow
```
User: I want to learn Python

Bot: Great choice! 🐍

Python Mastery Course (6 weeks)
⭐ 4.8/5 (1,247 students)
📚 45 lessons
🎯 5 projects
💰 KES 2,000 (or KES 500/month premium)

What you'll build:
• Calculator app
• To-do list
• Web scraper
• Data visualizer
• Final project: Your choice!

[Start Free Trial] [View Curriculum] [Preview]
```

### AI Tutoring
```
Student: I don't understand variables

AI Tutor: No problem! Think of a variable like a box 📦

You put something in the box and give it a name.

Example:
age = 25

Here, 'age' is the box name, 25 is what's inside.

You can use that box later:
print(age)  # Shows 25

Try it yourself! Create a variable called 'name'
with your name. Send me the code.
```

## 💰 Business Model

### B2C (Individual Learners)
- **Free Tier**: 3 courses, limited AI (50 questions/month)
- **Premium**: KES 500/month (unlimited courses, AI, certificates)
- **Course Purchase**: KES 1,000-5,000 per course (one-time)

### B2B (Enterprises)
- **Starter**: KES 10,000/month (up to 50 employees)
- **Growth**: KES 30,000/month (up to 200 employees)
- **Enterprise**: Custom pricing (unlimited, white-label)

### Creator Marketplace
- Revenue share: 70% creator / 30% platform
- Premium creators: 80% / 20% (for top performers)

## 🎯 MVP Roadmap (12 Weeks)

### Week 1-2: Foundation
- ✅ Database schema
- ✅ API setup (Hono)
- ✅ Basic Next.js app
- ✅ Authentication (magic link)

### Week 3-4: Core Features
- ✅ Course creation interface
- ✅ Lesson player
- ✅ Progress tracking
- ✅ Basic AI tutor

### Week 5-6: WhatsApp Integration
- ✅ WhatsApp webhook
- ✅ Message router
- ✅ AI conversation flow
- ✅ Media handling (images, videos)

### Week 7-8: Payments & Monetization
- ✅ M-Pesa integration
- ✅ Subscription management
- ✅ Creator payouts
- ✅ Premium features

### Week 9-10: Enhanced AI
- ✅ RAG system (vector search)
- ✅ Code execution sandbox
- ✅ Adaptive learning paths
- ✅ Assessment generation

### Week 11-12: Polish & Launch
- ✅ First course: "Web Development Basics"
- ✅ Beta testing (100 users)
- ✅ Analytics & monitoring
- ✅ Documentation

## 📈 Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Course completion rate
- AI tutor messages per user
- Time spent learning

### Business Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn rate

### Learning Outcomes
- Skills acquired
- Jobs obtained (via platform)
- Certificates issued
- Student satisfaction (NPS)

## 🔒 Security & Compliance

- ✅ Data encryption (at rest & in transit)
- ✅ GDPR compliant
- ✅ Secure payment processing
- ✅ Content moderation
- ✅ Rate limiting
- ✅ DDoS protection

## 🤝 Contributing

See individual package READMEs for contribution guidelines.

## 📄 License

MIT

---

**Built with ❤️ in Kenya for Africa**
