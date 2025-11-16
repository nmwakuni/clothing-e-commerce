import { Hono } from 'hono';

export const healthRouter = new Hono();

// Health check endpoint
healthRouter.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? process.uptime() : 0,
  });
});

// Detailed health check
healthRouter.get('/detailed', async (c) => {
  const checks = {
    api: 'ok',
    database: 'pending',
    whatsapp: 'pending',
    ai: 'pending',
  };

  // TODO: Add actual health checks for each service
  // For now, return mock data

  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks,
    version: '1.0.0',
  });
});
