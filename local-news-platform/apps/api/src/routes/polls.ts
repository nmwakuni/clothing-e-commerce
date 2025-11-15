import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { polls, pollVotes } from '@mtaa/database/schema';
import type { Env } from '../index';

export const pollsRouter = new Hono<{ Bindings: Env }>();

// GET /polls - Get active polls
pollsRouter.get('/', async (c) => {
  const db = drizzle(neon(c.env.DATABASE_URL));
  const locationId = c.req.query('locationId');

  const results = await db
    .select()
    .from(polls)
    .where(locationId ? eq(polls.locationId, locationId) : undefined)
    .limit(20);

  return c.json({ polls: results });
});

// POST /polls/:id/vote - Vote on a poll
pollsRouter.post('/:id/vote', async (c) => {
  const pollId = c.param('id');
  const body = await c.req.json();
  const { userId, optionIndex } = body;

  if (!userId || optionIndex === undefined) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const db = drizzle(neon(c.env.DATABASE_URL));

  // Create vote
  await db.insert(pollVotes).values({
    pollId,
    userId,
    optionIndex,
  });

  return c.json({ success: true });
});
