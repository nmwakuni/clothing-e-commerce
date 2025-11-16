import { Hono } from 'hono';
import { z } from 'zod';
import { db, sessions, users } from '@nafsi/database';
import { AICounselorService } from '@nafsi/ai-counselor';
import { eq, desc } from 'drizzle-orm';

export const sessionsRouter = new Hono();

// Schema for creating a new session message
const messageSchema = z.object({
  userId: z.string().uuid(),
  message: z.string().min(1),
  sessionId: z.string().uuid().optional(),
});

// GET /api/sessions/:userId - Get all sessions for a user
sessionsRouter.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.createdAt));

    return c.json({ sessions: userSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return c.json({ error: 'Failed to fetch sessions' }, 500);
  }
});

// GET /api/sessions/:userId/:sessionId - Get specific session
sessionsRouter.get('/:userId/:sessionId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const sessionId = c.req.param('sessionId');

    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session.length || session[0].userId !== userId) {
      return c.json({ error: 'Session not found' }, 404);
    }

    return c.json({ session: session[0] });
  } catch (error) {
    console.error('Error fetching session:', error);
    return c.json({ error: 'Failed to fetch session' }, 500);
  }
});

// POST /api/sessions/message - Send a message to AI counselor
sessionsRouter.post('/message', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, message, sessionId } = messageSchema.parse(body);

    // Get or create session
    let currentSession;
    if (sessionId) {
      const existing = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);
      currentSession = existing[0];
    }

    if (!currentSession) {
      // Create new session
      const [newSession] = await db
        .insert(sessions)
        .values({
          userId,
          sessionType: 'ai',
          messages: [],
          status: 'active',
        })
        .returning();
      currentSession = newSession;
    }

    // Get user context for personalized counseling
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const userContext = user[0]
      ? {
          primaryConcerns: user[0].primaryConcerns || [],
          triggers: user[0].triggers || [],
          copingStrategies: user[0].copingStrategies || [],
        }
      : undefined;

    // Get AI counselor response
    const counselor = new AICounselorService(c.env.ANTHROPIC_API_KEY);
    const sessionHistory = (currentSession.messages as any[]) || [];

    const response = await counselor.counsel(message, sessionHistory, userContext);

    // Update session with new messages
    const updatedMessages = [
      ...sessionHistory,
      { role: 'user' as const, content: message, timestamp: new Date().toISOString() },
      {
        role: 'assistant' as const,
        content: response.response,
        timestamp: new Date().toISOString(),
      },
    ];

    await db
      .update(sessions)
      .set({
        messages: updatedMessages,
        sentiment: response.sentiment,
        crisisDetected: response.crisisDetected,
        crisisLevel: response.crisisLevel || 'none',
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, currentSession.id));

    return c.json({
      sessionId: currentSession.id,
      response: response.response,
      sentiment: response.sentiment,
      crisisDetected: response.crisisDetected,
      crisisResources: response.crisisResources,
      recommendations: response.recommendations,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to process message' }, 500);
  }
});

// PATCH /api/sessions/:sessionId/end - End a session
sessionsRouter.patch('/:sessionId/end', async (c) => {
  try {
    const sessionId = c.req.param('sessionId');

    await db
      .update(sessions)
      .set({
        status: 'completed',
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, sessionId));

    return c.json({ success: true, message: 'Session ended successfully' });
  } catch (error) {
    console.error('Error ending session:', error);
    return c.json({ error: 'Failed to end session' }, 500);
  }
});
