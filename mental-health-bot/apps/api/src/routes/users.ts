import { Hono } from 'hono';
import { z } from 'zod';
import { db, users, safetyPlans, journalEntries } from '@nafsi/database';
import { eq, desc } from 'drizzle-orm';

export const usersRouter = new Hono();

// Schema for user profile update
const profileSchema = z.object({
  name: z.string().optional(),
  displayName: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  primaryConcerns: z.array(z.string()).optional(),
  triggers: z.array(z.string()).optional(),
  copingStrategies: z.array(z.string()).optional(),
  preferences: z.object({
    notifications: z.boolean().optional(),
    emailUpdates: z.boolean().optional(),
    shareDataForResearch: z.boolean().optional(),
  }).optional(),
});

// Schema for safety plan
const safetyPlanSchema = z.object({
  userId: z.string().uuid(),
  warningSigns: z.array(z.string()),
  copingStrategies: z.array(z.string()),
  distractions: z.array(z.string()),
  supportContacts: z.array(
    z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string(),
    })
  ),
  professionalContacts: z.array(
    z.object({
      name: z.string(),
      phone: z.string(),
      role: z.string(),
    })
  ),
  safeEnvironment: z.array(z.string()),
  reasonsToLive: z.array(z.string()),
});

// Schema for journal entry
const journalSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().optional(),
  content: z.string().min(1),
  mood: z.enum([
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
  ]).optional(),
  isPrivate: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

// GET /api/users/:id - Get user profile
usersRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user.length) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Remove sensitive fields
    const { id: userId, ...profile } = user[0];

    return c.json({ user: { id: userId, ...profile } });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// PATCH /api/users/:id - Update user profile
usersRouter.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const data = profileSchema.parse(body);

    await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    return c.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid profile data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// POST /api/users/:id/safety-plan - Create/update safety plan
usersRouter.post('/:id/safety-plan', async (c) => {
  try {
    const userId = c.req.param('id');
    const body = await c.req.json();
    const data = safetyPlanSchema.parse(body);

    // Check if user already has a safety plan
    const existing = await db
      .select()
      .from(safetyPlans)
      .where(eq(safetyPlans.userId, userId))
      .limit(1);

    let plan;
    if (existing.length > 0) {
      // Update existing
      [plan] = await db
        .update(safetyPlans)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(safetyPlans.userId, userId))
        .returning();
    } else {
      // Create new
      [plan] = await db.insert(safetyPlans).values(data).returning();
    }

    // Update user flag
    await db
      .update(users)
      .set({ hasSafetyPlan: true })
      .where(eq(users.id, userId));

    return c.json({ safetyPlan: plan });
  } catch (error) {
    console.error('Error saving safety plan:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid safety plan data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to save safety plan' }, 500);
  }
});

// GET /api/users/:id/safety-plan - Get user's safety plan
usersRouter.get('/:id/safety-plan', async (c) => {
  try {
    const userId = c.req.param('id');

    const plan = await db
      .select()
      .from(safetyPlans)
      .where(eq(safetyPlans.userId, userId))
      .limit(1);

    if (!plan.length) {
      return c.json({ error: 'No safety plan found' }, 404);
    }

    return c.json({ safetyPlan: plan[0] });
  } catch (error) {
    console.error('Error fetching safety plan:', error);
    return c.json({ error: 'Failed to fetch safety plan' }, 500);
  }
});

// POST /api/users/:id/journal - Create journal entry
usersRouter.post('/:id/journal', async (c) => {
  try {
    const userId = c.req.param('id');
    const body = await c.req.json();
    const data = journalSchema.parse({ ...body, userId });

    const [entry] = await db.insert(journalEntries).values(data).returning();

    return c.json({ entry }, 201);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid journal data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to create journal entry' }, 500);
  }
});

// GET /api/users/:id/journal - Get user's journal entries
usersRouter.get('/:id/journal', async (c) => {
  try {
    const userId = c.req.param('id');
    const limit = parseInt(c.req.query('limit') || '20');

    const entries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);

    return c.json({ entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return c.json({ error: 'Failed to fetch journal entries' }, 500);
  }
});

// GET /api/users/:id/stats - Get user statistics
usersRouter.get('/:id/stats', async (c) => {
  try {
    const userId = c.req.param('id');

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user.length) {
      return c.json({ error: 'User not found' }, 404);
    }

    const entries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));

    const stats = {
      memberSince: user[0].createdAt,
      journalEntries: entries.length,
      currentStreak: 0, // Would need date calculation
      hasSafetyPlan: user[0].hasSafetyPlan,
      riskLevel: user[0].riskLevel,
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});
