# Mteja - Setup Guide

Complete step-by-step guide to set up Mteja locally and deploy to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [API Keys & Services](#api-keys--services)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 9+ ([Installation](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/downloads))

### Verify Installation

```bash
node --version  # Should show v20.x.x or higher
pnpm --version  # Should show 9.x.x or higher
git --version   # Any recent version
```

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd mteja
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo (root + all packages + apps).

### 3. Verify Installation

```bash
pnpm list
```

You should see all workspace packages listed.

---

## Database Setup

### Option 1: Neon (Recommended - Free tier available)

1. **Create Account**
   - Go to [Neon.tech](https://neon.tech)
   - Sign up (free account)

2. **Create Project**
   - Click "New Project"
   - Choose region (closest to your users)
   - Copy the connection string

3. **Add to Environment Variables**
   - See `.env.local.example` in `apps/web/`
   - Add `DATABASE_URL=your-connection-string`

### Option 2: Local PostgreSQL

1. **Install PostgreSQL**
   - macOS: `brew install postgresql@15`
   - Ubuntu: `sudo apt-get install postgresql-15`
   - Windows: Download from [PostgreSQL.org](https://www.postgresql.org/download/)

2. **Create Database**
```bash
createdb mteja_dev
```

3. **Connection String**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/mteja_dev
```

### Run Migrations

```bash
# Generate migration files from schema
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# (Optional) Open Drizzle Studio to view database
pnpm db:studio
```

---

## API Keys & Services

### 1. Anthropic (Claude AI) - REQUIRED

**Purpose**: Profile optimization and message generation

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create account
3. Navigate to API Keys
4. Create new key
5. Copy key to `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Free tier**: $5 credit, then pay-as-you-go (~$3 per 1M tokens)

### 2. Clerk (Authentication) - REQUIRED

**Purpose**: User authentication and management

1. Go to [Clerk.com](https://clerk.com)
2. Create account (free tier available)
3. Create new application
4. Select authentication methods:
   - Email + Password ✓
   - Google OAuth ✓ (optional)
   - Phone ✓ (optional)
5. Copy keys to `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

6. Configure redirect URLs in Clerk dashboard:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

### 3. M-Pesa (Kenya Payments) - OPTIONAL

**Purpose**: Mobile money payments in Kenya

**Sandbox Setup** (for testing):

1. Go to [Safaricom Daraja](https://developer.safaricom.co.ke)
2. Create account
3. Create a new app
4. Get credentials:
```env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORT_CODE=174379  # Sandbox shortcode
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=sandbox
```

5. Register callback URL:
   - Go to "C2B Register URL" API
   - Register: `https://yourdomain.com/api/payments/mpesa/callback`

**Production Setup**:

1. Go live application with Safaricom
2. Get production credentials
3. Change `MPESA_ENVIRONMENT=production`

### 4. Pesapal (East Africa Payments) - OPTIONAL

**Purpose**: Cards, M-Pesa, Airtel Money across East Africa

1. Go to [Pesapal](https://www.pesapal.com)
2. Create merchant account
3. Get API credentials from dashboard
4. Add to `.env.local`:
```env
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_ENVIRONMENT=sandbox
```

5. Register IPN URL:
```bash
# After starting your server, run this once:
# The API will automatically register your IPN URL
# Or manually via Pesapal dashboard
```

---

## Running the Application

### Environment Variables

1. **Copy example file**:
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

2. **Fill in all required variables** (see above sections)

### Start Development Server

```bash
# Start all apps (uses Turborepo)
pnpm dev

# Or start individual apps
cd apps/web && pnpm dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### What to Expect

- Landing page at `/`
- Sign up at `/sign-up`
- Sign in at `/sign-in`
- Dashboard at `/dashboard` (requires auth)
- Profile optimizer at `/dashboard/profile-optimizer`

---

## Testing

### Run All Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test:watch
```

### Run Tests with Coverage

```bash
pnpm test:coverage
```

Coverage reports will be in `coverage/` directory.

### Lint Code

```bash
# Check for errors
pnpm lint

# Auto-fix errors
pnpm lint:fix
```

### Format Code

```bash
# Check formatting
pnpm format:check

# Auto-format
pnpm format
```

### Type Check

```bash
pnpm type-check
```

### Run All Checks (CI simulation)

```bash
pnpm validate
```

This runs: lint + type-check + test:coverage

---

## Deployment

### Vercel (Recommended)

**Step 1: Push to GitHub**

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

**Step 2: Import to Vercel**

1. Go to [Vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install && pnpm build --filter=@mteja/web`
   - **Output Directory**: `.next`

**Step 3: Add Environment Variables**

In Vercel dashboard, add ALL environment variables from `.env.local`:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `ANTHROPIC_API_KEY`
- `MPESA_*` (if using)
- `PESAPAL_*` (if using)
- `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)

**Step 4: Deploy**

Click "Deploy" - Vercel will build and deploy automatically.

**Step 5: Run Migrations**

After first deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migrations in production
vercel env pull
pnpm db:migrate
```

### Database Migration

For production database:
```bash
# From your local machine with production DATABASE_URL
DATABASE_URL=<production-url> pnpm db:migrate
```

---

## Troubleshooting

### Common Issues

**1. "Command not found: pnpm"**

Install pnpm:
```bash
npm install -g pnpm
```

**2. "Module not found" errors**

Reinstall dependencies:
```bash
rm -rf node_modules
pnpm install
```

**3. Database connection errors**

- Verify `DATABASE_URL` is correct
- Check if database is running (for local PostgreSQL)
- For Neon, check if your IP is allowed

**4. Clerk authentication not working**

- Verify publishable and secret keys
- Check redirect URLs in Clerk dashboard
- Clear browser cache and cookies

**5. Build errors in Vercel**

- Check build command includes `pnpm install` at root
- Verify all environment variables are set
- Check Vercel build logs for specific errors

**6. M-Pesa/Pesapal errors**

- Verify credentials are correct
- Check environment (sandbox vs production)
- Ensure callback URLs are registered
- Check phone number format (254XXXXXXXXX for Kenya)

### Getting Help

1. Check [GitHub Issues](your-repo-issues-url)
2. Review error logs:
   - Browser console (F12)
   - Terminal output
   - Vercel deployment logs
3. Contact support: support@mteja.africa

---

## Development Workflow

### Before Committing

Pre-commit hooks will automatically run:
- ESLint (auto-fix)
- Prettier (auto-format)

If hooks fail, fix the errors and commit again.

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature

# Create pull request on GitHub
```

### Adding New Packages

```bash
# Add dependency to specific package
pnpm add <package> --filter @mteja/web

# Add dev dependency to root
pnpm add -D <package> -w
```

---

## Next Steps

After setup:

1. ✅ Create your first user account
2. ✅ Run a profile audit
3. ✅ Test prospect research (paid feature)
4. ✅ Generate outreach messages
5. ✅ Test payment flow (use sandbox)
6. ✅ Customize branding and copy
7. ✅ Set up monitoring and analytics
8. ✅ Launch! 🚀

---

**Need help?** Check README.md or create an issue on GitHub.
