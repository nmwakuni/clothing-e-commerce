import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRouter } from './routes/auth';
import { sessionsRouter } from './routes/sessions';
import { moodsRouter } from './routes/moods';
import { crisisRouter } from './routes/crisis';
import { appointmentsRouter } from './routes/appointments';
import { resourcesRouter } from './routes/resources';
import { supportGroupsRouter } from './routes/support-groups';
import { therapistsRouter } from './routes/therapists';
import { usersRouter } from './routes/users';

type Bindings = {
  DATABASE_URL: string;
  ANTHROPIC_API_KEY: string;
  WHATSAPP_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://nafsi.app'],
    credentials: true,
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'healthy',
    service: 'Nafsi API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api/auth', authRouter);
app.route('/api/sessions', sessionsRouter);
app.route('/api/moods', moodsRouter);
app.route('/api/crisis', crisisRouter);
app.route('/api/appointments', appointmentsRouter);
app.route('/api/resources', resourcesRouter);
app.route('/api/support-groups', supportGroupsRouter);
app.route('/api/therapists', therapistsRouter);
app.route('/api/users', usersRouter);

// Error handling
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

export default app;
