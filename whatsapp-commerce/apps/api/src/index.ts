import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { productsRouter } from './routes/products';
import { ordersRouter } from './routes/orders';
import { paymentsRouter } from './routes/payments';
import { whatsappRouter } from './routes/whatsapp';
import { vendorsRouter } from './routes/vendors';

type Bindings = {
  DATABASE_URL: string;
  ANTHROPIC_API_KEY: string;
  WHATSAPP_API_KEY: string;
  MPESA_CONSUMER_KEY: string;
  MPESA_CONSUMER_SECRET: string;
  MPESA_BUSINESS_SHORT_CODE: string;
  MPESA_PASSKEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://biashara.app'],
    credentials: true,
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'healthy',
    service: 'Biashara API',
    version: '1.0.0',
    description: 'WhatsApp Commerce Platform for Africa',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api/products', productsRouter);
app.route('/api/orders', ordersRouter);
app.route('/api/payments', paymentsRouter);
app.route('/api/whatsapp', whatsappRouter);
app.route('/api/vendors', vendorsRouter);

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
