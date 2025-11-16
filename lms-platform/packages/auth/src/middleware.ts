import type { AuthService, UserPayload } from './index';

/**
 * Middleware helpers for authentication
 */

// Next.js middleware helper
export async function withAuth(
  authService: AuthService,
  request: Request,
  handler: (user: UserPayload) => Promise<Response>
): Promise<Response> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'No authorization header' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const token = authService.extractTokenFromHeader(authHeader);

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'Invalid authorization format' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const payload = await authService.verifyToken(token);

  if (!payload) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized', message: 'Invalid or expired token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return handler(payload);
}

// Hono middleware
export function createAuthMiddleware(authService: AuthService) {
  return async (c: any, next: any) => {
    const authHeader = c.req.header('authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authService.extractTokenFromHeader(authHeader);

    if (!token) {
      return c.json({ error: 'Invalid authorization format' }, 401);
    }

    const payload = await authService.verifyToken(token);

    if (!payload) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Attach user to context
    c.set('user', payload);

    await next();
  };
}

// Role-based access control middleware
export function requireRole(...allowedRoles: string[]) {
  return (c: any, next: any) => {
    const user = c.get('user') as UserPayload;

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
      return c.json({ error: 'Forbidden', message: 'Insufficient permissions' }, 403);
    }

    return next();
  };
}

// Optional auth middleware (doesn't fail if no token)
export function optionalAuth(authService: AuthService) {
  return async (c: any, next: any) => {
    const authHeader = c.req.header('authorization');

    if (authHeader) {
      const token = authService.extractTokenFromHeader(authHeader);

      if (token) {
        const payload = await authService.verifyToken(token);
        if (payload) {
          c.set('user', payload);
        }
      }
    }

    await next();
  };
}
