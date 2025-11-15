import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

// Routes
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { coursesRouter } from './routes/courses';
import { paymentsRouter } from './routes/payments';
import { whatsappRouter } from './routes/whatsapp';

// Types for Cloudflare Workers
type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  WHATSAPP_ACCESS_TOKEN: string;
  WHATSAPP_PHONE_ID: string;
  WHATSAPP_VERIFY_TOKEN: string;
  MPESA_CONSUMER_KEY: string;
  MPESA_CONSUMER_SECRET: string;
  MPESA_ENVIRONMENT: 'sandbox' | 'production';
  MPESA_SHORTCODE: string;
  MPESA_PASSKEY: string;
  MPESA_CALLBACK_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: (origin) => {
    // Allow localhost and production domains
    if (origin.includes('localhost') || origin.includes('vercel.app') || origin.includes('skillhub.co.ke')) {
      return origin;
    }
    return null;
  },
  credentials: true,
}));

// Root route
app.get('/', (c) => {
  return c.json({
    name: 'SkillHub Africa API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      courses: '/api/courses',
      payments: '/api/payments',
      whatsapp: '/api/whatsapp/webhook',
      docs: '/api/docs',
    },
  });
});

// Mount routers
app.route('/health', healthRouter);
app.route('/api/auth', authRouter);
app.route('/api/courses', coursesRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/whatsapp', whatsappRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500
  );
});

export default app;
