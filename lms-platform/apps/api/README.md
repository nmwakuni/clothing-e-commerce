# @lms/api - SkillHub Africa API

Hono-based API server for the LMS platform. Runs on Cloudflare Workers (edge runtime).

## Tech Stack

- **Framework**: Hono (ultra-fast web framework)
- **Runtime**: Cloudflare Workers
- **Database**: @lms/database (Neon PostgreSQL)
- **Validation**: Zod
- **Deployment**: Wrangler CLI

## Features

- ⚡ **Edge-optimized**: Runs globally on Cloudflare's edge network
- 🔄 **WhatsApp Integration**: Webhook for receiving/sending messages
- 🤖 **AI Tutoring**: Claude/GPT-4 integration
- 💳 **M-Pesa Payments**: Daraja API integration
- 📊 **Course Management**: CRUD operations for courses
- 🔐 **Authentication**: JWT-based auth
- 📈 **Analytics**: Track learning progress

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .dev.vars.example .dev.vars
   # Edit .dev.vars with your values
   ```

3. **Run development server**:
   ```bash
   pnpm dev
   ```

4. **API will be available at**: [http://localhost:8787](http://localhost:8787)

## API Endpoints

### Health
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check

### Courses
- `GET /api/courses` - List all published courses
- `GET /api/courses/:slug` - Get course by slug
- `POST /api/courses/:id/enroll` - Enroll in a course

### WhatsApp
- `GET /api/whatsapp/webhook` - Webhook verification (Meta)
- `POST /api/whatsapp/webhook` - Receive messages

### Users
- `POST /api/auth/login` - Login with phone number
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user

### Payments (M-Pesa)
- `POST /api/payments/mpesa/initiate` - Initiate STK push
- `POST /api/payments/mpesa/callback` - M-Pesa callback
- `GET /api/payments/:id/status` - Check payment status

## Project Structure

```
src/
├── index.ts              # Main Hono app
├── routes/               # API route handlers
│   ├── health.ts
│   ├── courses.ts
│   ├── whatsapp.ts
│   ├── users.ts
│   └── payments.ts
├── middleware/           # Custom middleware
│   ├── auth.ts
│   └── rateLimit.ts
└── services/            # Business logic
    ├── whatsapp.ts
    ├── ai-tutor.ts
    └── mpesa.ts
```

## WhatsApp Integration

### Setup Webhook

1. Go to Meta for Developers
2. Create a WhatsApp Business App
3. Configure webhook URL: `https://your-api.workers.dev/api/whatsapp/webhook`
4. Set verify token (same as `WHATSAPP_VERIFY_TOKEN`)
5. Subscribe to message events

### Message Flow

```
User sends WhatsApp message
  ↓
Meta sends webhook to /api/whatsapp/webhook
  ↓
API processes message
  ↓
Determine context (learning, browsing, support)
  ↓
AI generates response
  ↓
Send reply via WhatsApp API
  ↓
Update conversation in database
```

## AI Tutor Service

The AI tutor uses:
- **Claude 3.5 Sonnet** for conversational teaching
- **RAG (Retrieval Augmented Generation)** for course content
- **Function calling** for actions (enroll, track progress, etc.)

## M-Pesa Integration

Uses Safaricom Daraja API:
- STK Push for payments
- C2B for direct payments
- Transaction status queries

## Development

```bash
# Run dev server
pnpm dev

# Type checking
tsc --noEmit

# Deploy to Cloudflare Workers
pnpm deploy
```

## Environment Variables

### Required
- `DATABASE_URL` - Neon PostgreSQL connection string
- `WHATSAPP_TOKEN` - WhatsApp Business API token
- `WHATSAPP_VERIFY_TOKEN` - Webhook verification token
- `ANTHROPIC_API_KEY` - Claude API key

### Optional
- `OPENAI_API_KEY` - GPT-4 API key (fallback)
- `MPESA_CONSUMER_KEY` - M-Pesa app key
- `MPESA_CONSUMER_SECRET` - M-Pesa app secret

## Deployment

### Cloudflare Workers

```bash
# Deploy to production
wrangler deploy --env production

# Set secrets
wrangler secret put DATABASE_URL --env production
wrangler secret put ANTHROPIC_API_KEY --env production
wrangler secret put WHATSAPP_TOKEN --env production
```

### Custom Domain

Configure in `wrangler.toml`:
```toml
routes = [
  { pattern = "api.skillhub.co.ke/*", zone_name = "skillhub.co.ke" }
]
```

## Testing

```bash
# Test webhook locally
curl -X POST http://localhost:8787/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{"object":"whatsapp_business_account"}'

# Test course API
curl http://localhost:8787/api/courses
```

## Performance

Cloudflare Workers provide:
- **0ms cold start** (Hono is optimized for edge)
- **Global deployment** (runs in 200+ cities)
- **Auto-scaling** (handles any load)
- **Low cost** (100K requests/day free)

## Monitoring

View logs:
```bash
wrangler tail --env production
```

Analytics dashboard:
https://dash.cloudflare.com
