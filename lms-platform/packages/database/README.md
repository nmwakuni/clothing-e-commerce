# @lms/database

Database package for LMS Platform using Neon PostgreSQL and Drizzle ORM.

## Setup

1. **Create a Neon database**:
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Add your DATABASE_URL
   ```

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Generate migrations**:
   ```bash
   pnpm db:generate
   ```

5. **Run migrations**:
   ```bash
   pnpm db:migrate
   ```

6. **Seed sample data**:
   ```bash
   pnpm db:seed
   ```

## Scripts

- `pnpm db:generate` - Generate migrations from schema
- `pnpm db:migrate` - Run migrations
- `pnpm db:push` - Push schema changes directly (dev only)
- `pnpm db:studio` - Open Drizzle Studio (GUI)
- `pnpm db:seed` - Seed database with sample data

## Usage

```typescript
import { db, users, courses } from '@lms/database';

// Query users
const allUsers = await db.select().from(users);

// Insert a course
await db.insert(courses).values({
  title: 'My Course',
  slug: 'my-course',
  // ...
});
```

## Schema Overview

See [DATABASE_SCHEMA.md](../../docs/DATABASE_SCHEMA.md) for complete schema documentation.

### Core Tables
- `users` - User accounts
- `courses` - Course catalog
- `lessons` - Lesson content
- `enrollments` - User course enrollments
- `progress` - Learning progress
- `assessments` - Quizzes and tests
- `submissions` - Student submissions
- `certificates` - Issued certificates

### AI & Interactions
- `conversations` - WhatsApp conversations
- `messages` - Chat messages
- `ai_sessions` - AI tutoring sessions
- `feedback` - User feedback

### Payments
- `transactions` - All financial transactions
- `subscriptions` - Premium subscriptions
- `payouts` - Creator earnings

### Organizations (B2B)
- `organizations` - Company accounts
- `teams` - Team management
- `learning_paths` - Custom curricula

## Development

The database uses Drizzle ORM with Neon's serverless PostgreSQL driver for:
- ✅ Type-safe queries
- ✅ Edge-compatible (works in Cloudflare Workers)
- ✅ Auto-completion in IDEs
- ✅ Zero cold starts

## Production

For production:
1. Use Neon's production branch
2. Enable connection pooling
3. Set up read replicas (if needed)
4. Configure backups (Neon does this automatically)
