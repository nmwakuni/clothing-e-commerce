import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc, and, sql } from 'drizzle-orm';
import { articles, articleReactions, locations } from '@mtaa/database/schema';
import type { Env } from '../index';

export const articlesRouter = new Hono<{ Bindings: Env }>();

// GET /articles - Get all published articles with optional filters
articlesRouter.get('/', async (c) => {
  const db = drizzle(neon(c.env.DATABASE_URL));

  const locationSlug = c.req.query('location');
  const category = c.req.query('category');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  let query = db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      summary: articles.summary,
      category: articles.category,
      tags: articles.tags,
      featuredImage: articles.featuredImage,
      authorType: articles.authorType,
      locationId: articles.locationId,
      verificationStatus: articles.verificationStatus,
      verificationScore: articles.verificationScore,
      viewsCount: articles.viewsCount,
      commentsCount: articles.commentsCount,
      reactionsCount: articles.reactionsCount,
      isBreaking: articles.isBreaking,
      isPinned: articles.isPinned,
      publishedAt: articles.publishedAt,
      location: {
        name: locations.name,
        slug: locations.slug,
      },
    })
    .from(articles)
    .leftJoin(locations, eq(articles.locationId, locations.id))
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.isPinned), desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  const results = await query;

  return c.json({
    articles: results,
    pagination: {
      page,
      limit,
      hasMore: results.length === limit,
    },
  });
});

// GET /articles/:slug - Get single article by slug
articlesRouter.get('/:slug', async (c) => {
  const slug = c.param('slug');
  const db = drizzle(neon(c.env.DATABASE_URL));

  const [article] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
    .limit(1);

  if (!article) {
    return c.json({ error: 'Article not found' }, 404);
  }

  // Increment view count (in production, use queue/batch)
  await db
    .update(articles)
    .set({ viewsCount: sql`${articles.viewsCount} + 1` })
    .where(eq(articles.id, article.id));

  return c.json({ article: { ...article, viewsCount: article.viewsCount + 1 } });
});

// POST /articles/:id/reactions - Add reaction to article
articlesRouter.post('/:id/reactions', async (c) => {
  const articleId = c.param('id');
  const body = await c.req.json();
  const { userId, reactionType } = body;

  if (!userId || !reactionType) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  const db = drizzle(neon(c.env.DATABASE_URL));

  // Check if already reacted
  const existing = await db
    .select()
    .from(articleReactions)
    .where(
      and(eq(articleReactions.articleId, articleId), eq(articleReactions.userId, userId))
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing reaction
    await db
      .update(articleReactions)
      .set({ reactionType })
      .where(eq(articleReactions.id, existing[0].id));
  } else {
    // Create new reaction
    await db.insert(articleReactions).values({
      articleId,
      userId,
      reactionType,
    });

    // Increment reactions count
    await db
      .update(articles)
      .set({ reactionsCount: sql`${articles.reactionsCount} + 1` })
      .where(eq(articles.id, articleId));
  }

  return c.json({ success: true });
});

// GET /articles/trending - Get trending articles
articlesRouter.get('/trending', async (c) => {
  const db = drizzle(neon(c.env.DATABASE_URL));
  const locationSlug = c.req.query('location');

  // Simple trending algorithm: most views + reactions in last 24h
  const results = await db
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.status, 'published'),
        sql`${articles.publishedAt} > NOW() - INTERVAL '24 hours'`
      )
    )
    .orderBy(sql`${articles.viewsCount} + ${articles.reactionsCount} * 2 DESC`)
    .limit(10);

  return c.json({ articles: results });
});
