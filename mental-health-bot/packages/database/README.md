# Nafsi Database Package

This package contains the database schema, migrations, and utilities for the Nafsi mental health platform.

## Database Schema

The database uses PostgreSQL with Drizzle ORM. The schema includes:

- **users**: User accounts with privacy settings and mental health profiles
- **therapists**: Licensed mental health professionals
- **sessions**: AI and human therapy sessions
- **moods**: Mood tracking entries
- **journal_entries**: Private journaling
- **crisis_events**: Crisis detection and intervention tracking
- **safety_plans**: Personalized safety plans for users
- **appointments**: Therapy appointments
- **resources**: Mental health resources and materials
- **support_groups**: Peer support communities
- **group_members**: Group membership tracking
- **group_messages**: Group chat messages

## Running Migrations

```bash
# Generate migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Open Drizzle Studio (database GUI)
pnpm drizzle-kit studio
```

## Seeding Data

To seed the database with sample data:

```bash
psql $DATABASE_URL < seeds/seed.sql
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/nafsi
```

## Privacy & Security

- All user data is encrypted at rest
- PHI (Protected Health Information) complies with data protection regulations
- Anonymous mode available for maximum privacy
- Audit logs for all data access
