import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { userSubmissions } from '@mtaa/database/schema';
import { AIVerificationService } from '@mtaa/ai-verification';
import type { Env } from '../index';

export const submissionsRouter = new Hono<{ Bindings: Env }>();

// POST /submissions - Submit news story
submissionsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { userId, locationId, title, description, category, images, exactLocation } = body;

  if (!userId || !locationId || !title || !description || !category) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const db = drizzle(neon(c.env.DATABASE_URL));

  // Run AI verification
  const verificationService = new AIVerificationService({
    anthropicApiKey: c.env.ANTHROPIC_API_KEY,
    openaiApiKey: c.env.OPENAI_API_KEY,
    provider: 'claude',
  });

  const verification = await verificationService.verifyContent({
    title,
    content: description,
    authorType: 'journalist',
    category,
  });

  // Create submission
  const [submission] = await db
    .insert(userSubmissions)
    .values({
      userId,
      locationId,
      title,
      description,
      category,
      images: images || [],
      exactLocation,
      status: verification.credibilityScore > 60 ? 'under_review' : 'pending',
      aiVerificationScore: verification.credibilityScore,
      aiFlags: verification.flags,
    })
    .returning();

  return c.json({
    submission,
    verification: {
      score: verification.credibilityScore,
      decision: verification.decision,
    },
  });
});

// GET /submissions/:userId - Get user's submissions
submissionsRouter.get('/user/:userId', async (c) => {
  const userId = c.param('userId');
  const db = drizzle(neon(c.env.DATABASE_URL));

  const results = await db
    .select()
    .from(userSubmissions)
    .where(eq(userSubmissions.userId, userId));

  return c.json({ submissions: results });
});
