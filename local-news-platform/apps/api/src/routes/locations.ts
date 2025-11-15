import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc } from 'drizzle-orm';
import { locations, articles } from '@mtaa/database/schema';
import type { Env } from '../index';

export const locationsRouter = new Hono<{ Bindings: Env }>();

// GET /locations - Get all locations
locationsRouter.get('/', async (c) => {
  const db = drizzle(neon(c.env.DATABASE_URL));
  const city = c.req.query('city');

  const results = await db
    .select()
    .from(locations)
    .where(city ? eq(locations.city, city) : undefined)
    .orderBy(desc(locations.activeUsersCount));

  return c.json({ locations: results });
});

// GET /locations/:slug - Get location by slug
locationsRouter.get('/:slug', async (c) => {
  const slug = c.param('slug');
  const db = drizzle(neon(c.env.DATABASE_URL));

  const [location] = await db.select().from(locations).where(eq(locations.slug, slug)).limit(1);

  if (!location) {
    return c.json({ error: 'Location not found' }, 404);
  }

  return c.json({ location });
});

// GET /locations/:slug/articles - Get articles for a location
locationsRouter.get('/:slug/articles', async (c) => {
  const slug = c.param('slug');
  const db = drizzle(neon(c.env.DATABASE_URL));

  // First get the location
  const [location] = await db.select().from(locations).where(eq(locations.slug, slug)).limit(1);

  if (!location) {
    return c.json({ error: 'Location not found' }, 404);
  }

  // Then get articles
  const results = await db
    .select()
    .from(articles)
    .where(eq(articles.locationId, location.id))
    .orderBy(desc(articles.publishedAt))
    .limit(20);

  return c.json({ articles: results });
});
