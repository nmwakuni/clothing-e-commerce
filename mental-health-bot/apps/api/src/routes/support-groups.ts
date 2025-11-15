import { Hono } from 'hono';
import { z } from 'zod';
import { db, supportGroups, groupMembers, groupMessages } from '@nafsi/database';
import { eq, and, desc } from 'drizzle-orm';

export const supportGroupsRouter = new Hono();

// Schema for creating support group
const groupSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  topic: z.enum([
    'anxiety',
    'depression',
    'trauma',
    'grief',
    'addiction',
    'relationships',
    'parenting',
    'lgbtq',
    'general',
  ]),
  isPrivate: z.boolean().default(false),
  maxMembers: z.number().min(2).max(50).default(20),
});

// Schema for posting message
const messageSchema = z.object({
  userId: z.string().uuid(),
  content: z.string().min(1),
  isAnonymous: z.boolean().default(false),
});

// GET /api/support-groups - Get all support groups
supportGroupsRouter.get('/', async (c) => {
  try {
    const topic = c.req.query('topic');

    let query = db
      .select()
      .from(supportGroups)
      .where(and(eq(supportGroups.isActive, true), eq(supportGroups.isPrivate, false)));

    if (topic) {
      query = query.where(eq(supportGroups.topic, topic as any)) as any;
    }

    const groups = await query.orderBy(desc(supportGroups.createdAt));

    return c.json({ groups });
  } catch (error) {
    console.error('Error fetching support groups:', error);
    return c.json({ error: 'Failed to fetch support groups' }, 500);
  }
});

// POST /api/support-groups - Create new support group
supportGroupsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const data = groupSchema.parse(body);
    const { moderatorId } = body;

    const [group] = await db
      .insert(supportGroups)
      .values({
        ...data,
        moderatorId,
        currentMembers: 1,
        isActive: true,
      })
      .returning();

    // Add moderator as first member
    await db.insert(groupMembers).values({
      groupId: group.id,
      userId: moderatorId,
      role: 'moderator',
      joinedAt: new Date(),
    });

    return c.json({ group }, 201);
  } catch (error) {
    console.error('Error creating support group:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid group data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to create support group' }, 500);
  }
});

// GET /api/support-groups/:groupId - Get specific group details
supportGroupsRouter.get('/:groupId', async (c) => {
  try {
    const groupId = c.req.param('groupId');

    const group = await db
      .select()
      .from(supportGroups)
      .where(eq(supportGroups.id, groupId))
      .limit(1);

    if (!group.length) {
      return c.json({ error: 'Group not found' }, 404);
    }

    // Get members
    const members = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    return c.json({ group: group[0], members });
  } catch (error) {
    console.error('Error fetching group:', error);
    return c.json({ error: 'Failed to fetch group' }, 500);
  }
});

// POST /api/support-groups/:groupId/join - Join a support group
supportGroupsRouter.post('/:groupId/join', async (c) => {
  try {
    const groupId = c.req.param('groupId');
    const { userId } = await c.req.json();

    // Check if group exists and has space
    const group = await db
      .select()
      .from(supportGroups)
      .where(eq(supportGroups.id, groupId))
      .limit(1);

    if (!group.length) {
      return c.json({ error: 'Group not found' }, 404);
    }

    if (group[0].currentMembers >= group[0].maxMembers) {
      return c.json({ error: 'Group is full' }, 400);
    }

    // Check if already a member
    const existing = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));

    if (existing.length > 0) {
      return c.json({ error: 'Already a member' }, 400);
    }

    // Add member
    await db.insert(groupMembers).values({
      groupId,
      userId,
      role: 'member',
      joinedAt: new Date(),
    });

    // Update member count
    await db
      .update(supportGroups)
      .set({ currentMembers: group[0].currentMembers + 1 })
      .where(eq(supportGroups.id, groupId));

    return c.json({ success: true, message: 'Joined group successfully' });
  } catch (error) {
    console.error('Error joining group:', error);
    return c.json({ error: 'Failed to join group' }, 500);
  }
});

// GET /api/support-groups/:groupId/messages - Get group messages
supportGroupsRouter.get('/:groupId/messages', async (c) => {
  try {
    const groupId = c.req.param('groupId');
    const limit = parseInt(c.req.query('limit') || '50');

    const messages = await db
      .select()
      .from(groupMessages)
      .where(eq(groupMessages.groupId, groupId))
      .orderBy(desc(groupMessages.postedAt))
      .limit(limit);

    return c.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// POST /api/support-groups/:groupId/messages - Post message to group
supportGroupsRouter.post('/:groupId/messages', async (c) => {
  try {
    const groupId = c.req.param('groupId');
    const body = await c.req.json();
    const data = messageSchema.parse(body);

    // Verify user is member
    const membership = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, data.userId)))
      .limit(1);

    if (!membership.length) {
      return c.json({ error: 'Must be a member to post' }, 403);
    }

    const [message] = await db
      .insert(groupMessages)
      .values({
        groupId,
        userId: data.userId,
        content: data.content,
        isAnonymous: data.isAnonymous,
        postedAt: new Date(),
      })
      .returning();

    return c.json({ message }, 201);
  } catch (error) {
    console.error('Error posting message:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid message data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to post message' }, 500);
  }
});
