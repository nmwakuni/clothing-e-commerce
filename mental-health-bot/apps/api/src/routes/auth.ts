import { Hono } from 'hono';
import { createAuth } from '@nafsi/auth';

export const authRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

// Better Auth handler
authRouter.all('/*', async (c) => {
  const auth = createAuth(
    c.env.DATABASE_URL,
    c.req.url.split('/api/auth')[0]
  );

  return await auth.handler(c.req.raw);
});

export { authRouter };
