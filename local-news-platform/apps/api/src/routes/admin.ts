import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { userSubmissions, articles, articleVerificationLogs } from '@mtaa/database/schema';
import { AIVerificationService } from '@mtaa/ai-verification';
import type { Env } from '../index';

export const adminRouter = new Hono<{ Bindings: Env }>();

// GET /admin/submissions - Get pending submissions
adminRouter.get('/submissions', async (c) => {
  const db = drizzle(neon(c.env.DATABASE_URL));

  const results = await db
    .select()
    .from(userSubmissions)
    .where(eq(userSubmissions.status, 'pending'));

  return c.json({ submissions: results });
});

// POST /admin/submissions/:id/approve - Approve submission
adminRouter.post('/submissions/:id/approve', async (c) => {
  const submissionId = c.param('id');
  const body = await c.req.json();
  const { adminId } = body;

  const db = drizzle(neon(c.env.DATABASE_URL));

  // Get submission
  const [submission] = await db
    .select()
    .from(userSubmissions)
    .where(eq(userSubmissions.id, submissionId))
    .limit(1);

  if (!submission) {
    return c.json({ error: 'Submission not found' }, 404);
  }

  // Create article from submission
  const [article] = await db
    .insert(articles)
    .values({
      title: submission.title,
      slug: submission.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      summary: submission.description.substring(0, 150),
      content: submission.description,
      authorId: submission.userId,
      authorType: 'journalist',
      locationId: submission.locationId,
      category: submission.category,
      images: submission.images,
      verificationStatus: 'verified',
      verifiedBy: adminId,
      verifiedAt: new Date(),
      sourceType: 'citizen_journalist',
      status: 'published',
      publishedAt: new Date(),
    })
    .returning();

  // Update submission
  await db
    .update(userSubmissions)
    .set({
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      publishedArticleId: article.id,
    })
    .where(eq(userSubmissions.id, submissionId));

  return c.json({ success: true, article });
});

// POST /admin/submissions/:id/reject - Reject submission
adminRouter.post('/submissions/:id/reject', async (c) => {
  const submissionId = c.param('id');
  const body = await c.req.json();
  const { adminId, notes } = body;

  const db = drizzle(neon(c.env.DATABASE_URL));

  await db
    .update(userSubmissions)
    .set({
      status: 'rejected',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      reviewNotes: notes,
    })
    .where(eq(userSubmissions.id, submissionId));

  return c.json({ success: true });
});
