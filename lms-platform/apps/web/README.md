# @lms/web - SkillHub Africa Web Application

Next.js 15 web application for the LMS platform.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Database**: @lms/database package
- **UI Components**: Custom components with Tailwind

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Run development server**:
   ```bash
   pnpm dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Student dashboard
│   ├── courses/           # Course browsing & player
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── course/           # Course-related components
│   └── dashboard/        # Dashboard components
└── lib/                  # Utilities & helpers
    ├── store/            # Zustand stores
    └── hooks/            # Custom React hooks
```

## Key Features

- 📱 Responsive design (mobile-first)
- 🎨 Beautiful UI with Tailwind CSS
- ⚡ Fast page loads with Next.js 15
- 🔐 Authentication (NextAuth.js)
- 📊 Student dashboard
- 🎓 Course player
- 💳 Payment integration (M-Pesa)
- 🌐 WhatsApp integration links

## Development

```bash
# Run dev server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

Deploy to Vercel:

```bash
vercel
```

The app is optimized for Vercel's Edge Runtime.
