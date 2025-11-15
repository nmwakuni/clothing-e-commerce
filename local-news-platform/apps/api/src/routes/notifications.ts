import { Hono } from 'hono';
import type { Env } from '../index';

export const notificationsRouter = new Hono<{ Bindings: Env }>();

// GET /notifications/:userId - Get user notifications
notificationsRouter.get('/:userId', async (c) => {
  return c.json({ notifications: [] });
});

// POST /notifications/subscribe - Subscribe to WhatsApp updates
notificationsRouter.post('/subscribe', async (c) => {
  const body = await c.req.json();
  const { phoneNumber, locationIds } = body;

  // TODO: Implement WhatsApp subscription
  return c.json({ success: true });
});
