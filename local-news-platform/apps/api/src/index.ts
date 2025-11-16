import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { articlesRouter } from './routes/articles';
import { locationsRouter } from './routes/locations';
import { submissionsRouter } from './routes/submissions';
import { businessesRouter } from './routes/businesses';
import { commentsRouter } from './routes/comments';
import { pollsRouter } from './routes/polls';
import { notificationsRouter } from './routes/notifications';
import { adminRouter } from './routes/admin';

export type Env = {
  DATABASE_URL: string;
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY?: string;
  WHATSAPP_ACCESS_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  RESEND_API_KEY?: string;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('/*', cors());

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Mtaa News API',
    version: '1.0.0',
    status: 'healthy',
  });
});

// Mount routers
app.route('/articles', articlesRouter);
app.route('/locations', locationsRouter);
app.route('/submissions', submissionsRouter);
app.route('/businesses', businessesRouter);
app.route('/comments', commentsRouter);
app.route('/polls', pollsRouter);
app.route('/notifications', notificationsRouter);
app.route('/admin', adminRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

export default app;
