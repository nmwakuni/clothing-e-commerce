import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and, desc } from 'drizzle-orm';
import { businesses, events, classifieds } from '@mtaa/database/schema';
import type { Env } from '../index';

export const businessesRouter = new Hono<{ Bindings: Env }>();

// GET /businesses - Get businesses by location
businessesRouter.get('/', async (c) => {
  const db = drizzle(neon(c.env.DATABASE_URL));
  const locationId = c.req.query('locationId');
  const category = c.req.query('category');

  const results = await db
    .select()
    .from(businesses)
    .where(and(eq(businesses.status, 'active'), locationId ? eq(businesses.locationId, locationId) : undefined))
    .orderBy(desc(businesses.featuredListing), desc(businesses.averageRating))
    .limit(50);

  return c.json({ businesses: results });
});

// GET /businesses/:slug - Get business by slug
businessesRouter.get('/:slug', async (c) => {
  const slug = c.param('slug');
  const db = drizzle(neon(c.env.DATABASE_URL));

  const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);

  if (!business) {
    return c.json({ error: 'Business not found' }, 404);
  }

  return c.json({ business });
});

// GET /events - Get upcoming events
export const eventsRouter = new Hono<{ Bindings: Env }>();

eventsRouter.get('/', async (c) => {
  const db = drizzle(neon(c.env.DATABASE_URL));
  const locationId = c.req.query('locationId');

  const results = await db
    .select()
    .from(events)
    .where(locationId ? eq(events.locationId, locationId) : undefined)
    .orderBy(events.startDate)
    .limit(20);

  return c.json({ events: results });
});

// GET /classifieds - Get active classifieds
export const classifiedsRouter = new Hono<{ Bindings: Env }>();

classifiedsRouter.get('/', async (c) => {
  const db = drizzle(neon(c.env.DATABASE_URL));
  const locationId = c.req.query('locationId');
  const category = c.req.query('category');

  const results = await db
    .select()
    .from(classifieds)
    .where(and(eq(classifieds.status, 'active'), locationId ? eq(classifieds.locationId, locationId) : undefined))
    .orderBy(desc(classifieds.createdAt))
    .limit(50);

  return c.json({ classifieds: results });
});
