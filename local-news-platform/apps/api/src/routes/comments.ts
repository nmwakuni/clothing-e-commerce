import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc, sql } from 'drizzle-orm';
import { comments } from '@mtaa/database/schema';
import type { Env } from '../index';

export const commentsRouter = new Hono<{ Bindings: Env }>();

// GET /comments/article/:articleId - Get comments for article
commentsRouter.get('/article/:articleId', async (c) => {
  const articleId = c.param('articleId');
  const db = drizzle(neon(c.env.DATABASE_URL));

  const results = await db
    .select()
    .from(comments)
    .where(eq(comments.articleId, articleId))
    .orderBy(desc(comments.createdAt));

  return c.json({ comments: results });
});

// POST /comments - Create comment
commentsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { articleId, userId, content, parentCommentId } = body;

  if (!articleId || !userId || !content) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const db = drizzle(neon(c.env.DATABASE_URL));

  const [comment] = await db
    .insert(comments)
    .values({
      articleId,
      userId,
      content,
      parentCommentId: parentCommentId || null,
    })
    .returning();

  return c.json({ comment });
});
