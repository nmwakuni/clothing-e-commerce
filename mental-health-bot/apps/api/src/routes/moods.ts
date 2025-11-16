import { Hono } from 'hono';
import { z } from 'zod';
import { db, moods } from '@nafsi/database';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export const moodsRouter = new Hono();

// Schema for logging mood
const moodSchema = z.object({
  userId: z.string().uuid(),
  moodLevel: z.number().min(1).max(10),
  moodType: z.enum([
    'happy',
    'sad',
    'anxious',
    'angry',
    'calm',
    'stressed',
    'excited',
    'lonely',
    'overwhelmed',
    'grateful',
  ]),
  note: z.string().optional(),
  activities: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
  symptoms: z.array(z.string()).optional(),
});

// POST /api/moods - Log a new mood entry
moodsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const data = moodSchema.parse(body);

    const [mood] = await db
      .insert(moods)
      .values({
        ...data,
        recordedAt: new Date(),
      })
      .returning();

    return c.json({ mood }, 201);
  } catch (error) {
    console.error('Error logging mood:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid mood data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to log mood' }, 500);
  }
});

// GET /api/moods/:userId - Get mood history for a user
moodsRouter.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '30');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');

    let query = db.select().from(moods).where(eq(moods.userId, userId));

    if (startDate && endDate) {
      query = query.where(
        and(
          gte(moods.recordedAt, new Date(startDate)),
          lte(moods.recordedAt, new Date(endDate))
        )
      ) as any;
    }

    const userMoods = await query.orderBy(desc(moods.recordedAt)).limit(limit);

    // Calculate average mood level
    const avgMood =
      userMoods.reduce((sum, m) => sum + m.moodLevel, 0) / (userMoods.length || 1);

    return c.json({
      moods: userMoods,
      stats: {
        count: userMoods.length,
        averageMood: avgMood.toFixed(1),
      },
    });
  } catch (error) {
    console.error('Error fetching moods:', error);
    return c.json({ error: 'Failed to fetch mood history' }, 500);
  }
});

// GET /api/moods/:userId/analytics - Get mood analytics
moodsRouter.get('/:userId/analytics', async (c) => {
  try {
    const userId = c.req.param('userId');
    const days = parseInt(c.req.query('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userMoods = await db
      .select()
      .from(moods)
      .where(and(eq(moods.userId, userId), gte(moods.recordedAt, startDate)))
      .orderBy(desc(moods.recordedAt));

    // Calculate analytics
    const moodCounts = userMoods.reduce(
      (acc, m) => {
        acc[m.moodType] = (acc[m.moodType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const avgMood =
      userMoods.reduce((sum, m) => sum + m.moodLevel, 0) / (userMoods.length || 1);

    const allTriggers = userMoods
      .flatMap((m) => m.triggers || [])
      .reduce(
        (acc, trigger) => {
          acc[trigger] = (acc[trigger] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    const topTriggers = Object.entries(allTriggers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }));

    return c.json({
      analytics: {
        period: `${days} days`,
        totalEntries: userMoods.length,
        averageMood: avgMood.toFixed(1),
        moodDistribution: moodCounts,
        topTriggers,
        trend:
          userMoods.length > 1
            ? userMoods[0].moodLevel > userMoods[userMoods.length - 1].moodLevel
              ? 'improving'
              : 'declining'
            : 'stable',
      },
    });
  } catch (error) {
    console.error('Error fetching mood analytics:', error);
    return c.json({ error: 'Failed to fetch mood analytics' }, 500);
  }
});
