import { Hono } from 'hono';
import { z } from 'zod';
import { db, resources } from '@nafsi/database';
import { eq, or, like, desc } from 'drizzle-orm';

export const resourcesRouter = new Hono();

// Schema for creating resource
const resourceSchema = z.object({
  title: z.string().min(1),
  type: z.enum([
    'article',
    'video',
    'podcast',
    'worksheet',
    'meditation',
    'breathing_exercise',
    'hotline',
  ]),
  category: z.enum([
    'anxiety',
    'depression',
    'stress',
    'trauma',
    'relationships',
    'self_care',
    'crisis',
  ]),
  content: z.string(),
  url: z.string().url().optional(),
  estimatedTime: z.number().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

// GET /api/resources - Get all resources with filtering
resourcesRouter.get('/', async (c) => {
  try {
    const type = c.req.query('type');
    const category = c.req.query('category');
    const search = c.req.query('search');

    let query = db.select().from(resources).where(eq(resources.isPublished, true));

    if (type) {
      query = query.where(eq(resources.type, type as any)) as any;
    }

    if (category) {
      query = query.where(eq(resources.category, category as any)) as any;
    }

    if (search) {
      query = query.where(
        or(like(resources.title, `%${search}%`), like(resources.content, `%${search}%`))
      ) as any;
    }

    const allResources = await query.orderBy(desc(resources.createdAt));

    return c.json({ resources: allResources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return c.json({ error: 'Failed to fetch resources' }, 500);
  }
});

// GET /api/resources/:id - Get specific resource
resourcesRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const resource = await db.select().from(resources).where(eq(resources.id, id)).limit(1);

    if (!resource.length) {
      return c.json({ error: 'Resource not found' }, 404);
    }

    return c.json({ resource: resource[0] });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return c.json({ error: 'Failed to fetch resource' }, 500);
  }
});

// POST /api/resources - Create new resource (admin only)
resourcesRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const data = resourceSchema.parse(body);

    const [resource] = await db
      .insert(resources)
      .values({
        ...data,
        isPublished: false, // Requires admin approval
      })
      .returning();

    return c.json({ resource }, 201);
  } catch (error) {
    console.error('Error creating resource:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid resource data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to create resource' }, 500);
  }
});

// GET /api/resources/categories/:category - Get resources by category
resourcesRouter.get('/categories/:category', async (c) => {
  try {
    const category = c.req.param('category');

    const categoryResources = await db
      .select()
      .from(resources)
      .where(eq(resources.category, category as any))
      .orderBy(desc(resources.createdAt));

    return c.json({ resources: categoryResources });
  } catch (error) {
    console.error('Error fetching category resources:', error);
    return c.json({ error: 'Failed to fetch resources' }, 500);
  }
});
