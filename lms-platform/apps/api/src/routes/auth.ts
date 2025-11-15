import { Hono } from 'hono';
import { createAuthService } from '@lms/auth';
import { db } from '@lms/database';
import { users } from '@lms/database/schema/users';
import { eq } from 'drizzle-orm';
import { createWhatsAppService } from '@lms/whatsapp';

const authRouter = new Hono<{ Bindings: { JWT_SECRET: string; WHATSAPP_ACCESS_TOKEN: string; WHATSAPP_PHONE_ID: string } }>();

/**
 * POST /auth/magic-link
 * Generate and send magic link for phone-based login
 */
authRouter.post('/magic-link', async (c) => {
  try {
    const { phoneNumber } = await c.req.json();

    if (!phoneNumber) {
      return c.json({ error: 'Phone number is required' }, 400);
    }

    const auth = createAuthService({
      jwtSecret: c.env.JWT_SECRET,
    });

    // Format and validate phone number
    const formatted = auth.formatPhoneNumber(phoneNumber);
    if (!auth.validatePhoneNumber(formatted)) {
      return c.json({ error: 'Invalid phone number format' }, 400);
    }

    // Generate magic link
    const { token, link, expiresAt } = await auth.generateMagicLink(formatted);

    // Send via WhatsApp
    const whatsapp = createWhatsAppService({
      accessToken: c.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: c.env.WHATSAPP_PHONE_ID,
    });

    await whatsapp.sendText(
      formatted,
      `🎓 *SkillHub Africa - Login Link*

Click the link below to login to your account:

${link}

⏰ This link expires in 15 minutes.

_For security, don't share this link with anyone._`
    );

    return c.json({
      success: true,
      message: 'Login link sent to your WhatsApp',
      expiresAt,
    });
  } catch (error) {
    console.error('Error generating magic link:', error);
    return c.json(
      {
        error: 'Failed to send login link. Please try again.',
      },
      500
    );
  }
});

/**
 * POST /auth/verify
 * Verify magic link token and create session
 */
authRouter.post('/verify', async (c) => {
  try {
    const { token } = await c.req.json();

    if (!token) {
      return c.json({ error: 'Token is required' }, 400);
    }

    const auth = createAuthService({
      jwtSecret: c.env.JWT_SECRET,
    });

    // Verify magic link
    const phoneNumber = await auth.verifyMagicLink(token);

    if (!phoneNumber) {
      return c.json({ error: 'Invalid or expired login link' }, 410);
    }

    // Find or create user
    let user = await db.query.users.findFirst({
      where: eq(users.phoneNumber, phoneNumber),
    });

    if (!user) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          phoneNumber,
          role: 'student',
          subscriptionTier: 'free',
        })
        .returning();

      user = newUser;
    }

    // Create session
    const session = await auth.createSession({
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
    });

    return c.json({
      success: true,
      user: session.user,
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Error verifying magic link:', error);
    return c.json(
      {
        error: 'Failed to verify login link. Please try again.',
      },
      500
    );
  }
});

/**
 * POST /auth/refresh
 * Refresh JWT token
 */
authRouter.post('/refresh', async (c) => {
  try {
    const { token } = await c.req.json();

    if (!token) {
      return c.json({ error: 'Token is required' }, 400);
    }

    const auth = createAuthService({
      jwtSecret: c.env.JWT_SECRET,
    });

    const newSession = await auth.refreshSession(token);

    if (!newSession) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    return c.json({
      success: true,
      token: newSession.token,
      expiresAt: newSession.expiresAt,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return c.json({ error: 'Failed to refresh token' }, 500);
  }
});

/**
 * GET /auth/me
 * Get current user info (requires authentication)
 */
authRouter.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const auth = createAuthService({
      jwtSecret: c.env.JWT_SECRET,
    });

    const token = auth.extractTokenFromHeader(authHeader);
    const payload = await auth.verifyToken(token);

    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Get full user data from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        xpPoints: user.xpPoints,
        level: user.level,
        streakDays: user.streakDays,
        profilePictureUrl: user.profilePictureUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    return c.json({ error: 'Failed to get user info' }, 500);
  }
});

export { authRouter };
