# @lms/auth

Authentication system for LMS Platform with phone-based login and JWT tokens.

## Features

- 📱 **Phone-based authentication** (perfect for WhatsApp users)
- 🔗 **Magic link login** (passwordless)
- 🎫 **JWT tokens** with automatic expiry
- 🔄 **Session refresh**
- 🛡️ **Middleware** for protected routes
- 👥 **Role-based access control** (RBAC)
- ✅ **Phone number validation** (Kenya format)

## Quick Start

```typescript
import { createAuthService } from '@lms/auth';

const auth = createAuthService({
  jwtSecret: process.env.JWT_SECRET!,
  tokenExpiry: '7d', // optional, default 7 days
  magicLinkExpiry: 15, // optional, minutes, default 15
});
```

## Phone-Based Login Flow

### 1. User requests login
```typescript
// User enters phone number: 0712345678
const formatted = auth.formatPhoneNumber('0712345678');
// Returns: +254712345678

// Validate
if (!auth.validatePhoneNumber(formatted)) {
  throw new Error('Invalid phone number');
}
```

### 2. Generate magic link
```typescript
const { token, link, expiresAt } = await auth.generateMagicLink('+254712345678');

// Send via WhatsApp
await whatsapp.sendText(
  '+254712345678',
  `Click to login: ${link}\n\nExpires in 15 minutes.`
);

// Or send via SMS
await sms.send('+254712345678', `Your login link: ${link}`);
```

### 3. Verify magic link
```typescript
// When user clicks link
const phoneNumber = await auth.verifyMagicLink(token);

if (!phoneNumber) {
  // Link expired or invalid
  return { error: 'Invalid or expired link' };
}

// Get or create user
const user = await db.users.findUnique({
  where: { phoneNumber },
}) || await db.users.create({
  data: { phoneNumber },
});

// Create session
const session = await auth.createSession(user);

// Return session to client
return {
  user: session.user,
  token: session.token,
  expiresAt: session.expiresAt,
};
```

### 4. Client stores token
```typescript
// Client-side (browser)
localStorage.setItem('token', session.token);

// Include in API requests
const response = await fetch('/api/courses', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Session Management

### Create session from user
```typescript
const session = await auth.createSession({
  id: 'user_123',
  phoneNumber: '+254712345678',
  email: 'john@example.com', // optional
  fullName: 'John Doe', // optional
  role: 'student', // optional
  subscriptionTier: 'premium', // optional
});

// Returns:
// {
//   user: { id, phoneNumber, email, fullName, role, subscriptionTier },
//   token: 'eyJhbGc...',
//   expiresAt: Date
// }
```

### Verify token
```typescript
const payload = await auth.verifyToken(token);

if (payload) {
  console.log('User ID:', payload.userId);
  console.log('Phone:', payload.phoneNumber);
  console.log('Role:', payload.role);
} else {
  console.log('Invalid or expired token');
}
```

### Refresh session
```typescript
const newSession = await auth.refreshSession(oldToken);

if (newSession) {
  // Update token in client
  localStorage.setItem('token', newSession.token);
} else {
  // Token invalid, redirect to login
  window.location.href = '/login';
}
```

## Protected Routes

### Next.js API Route
```typescript
import { createAuthService, withAuth } from '@lms/auth';

const auth = createAuthService({ jwtSecret: process.env.JWT_SECRET! });

export async function GET(request: Request) {
  return withAuth(auth, request, async (user) => {
    // User is authenticated
    const courses = await getUserCourses(user.userId);

    return new Response(JSON.stringify(courses), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
```

### Hono API Route
```typescript
import { Hono } from 'hono';
import { createAuthService, createAuthMiddleware } from '@lms/auth';

const app = new Hono();
const auth = createAuthService({ jwtSecret: process.env.JWT_SECRET! });

// Apply auth middleware to all routes
app.use('/api/*', createAuthMiddleware(auth));

app.get('/api/profile', (c) => {
  const user = c.get('user'); // Automatically available
  return c.json({ user });
});
```

### Role-Based Access Control
```typescript
import { requireRole } from '@lms/auth';

// Only admins can access
app.get('/api/admin/users',
  createAuthMiddleware(auth),
  requireRole('admin'),
  async (c) => {
    const users = await db.users.findMany();
    return c.json(users);
  }
);

// Admins and creators
app.post('/api/courses',
  createAuthMiddleware(auth),
  requireRole('admin', 'creator'),
  async (c) => {
    // Create course
  }
);
```

### Optional Auth (Public + Private Data)
```typescript
import { optionalAuth } from '@lms/auth';

// Works for both authenticated and unauthenticated users
app.get('/api/courses',
  optionalAuth(auth),
  async (c) => {
    const user = c.get('user'); // May be undefined

    if (user) {
      // Show user's enrolled courses + public courses
      return c.json(await getCoursesForUser(user.userId));
    } else {
      // Show only public courses
      return c.json(await getPublicCourses());
    }
  }
);
```

## Phone Number Formatting

Supports all Kenya formats:
```typescript
auth.formatPhoneNumber('0712345678')   // → +254712345678
auth.formatPhoneNumber('+254712345678') // → +254712345678
auth.formatPhoneNumber('254712345678')  // → +254712345678
auth.formatPhoneNumber('712345678')     // → +254712345678
```

## Validation

```typescript
auth.validatePhoneNumber('+254712345678') // ✅ true
auth.validatePhoneNumber('+254112345678') // ✅ true (landline)
auth.validatePhoneNumber('+254612345678') // ❌ false (invalid prefix)
auth.validatePhoneNumber('+255712345678') // ❌ false (wrong country)
```

## Security Best Practices

1. **Environment Variables**
   ```bash
   JWT_SECRET=your-random-secret-here # Use a strong, random string
   ```

2. **HTTPS Only**
   - Magic links must be sent over HTTPS
   - Tokens must be transmitted over HTTPS

3. **Token Storage**
   - **Client**: Use `localStorage` or secure cookies
   - **Never** expose tokens in URLs
   - Clear tokens on logout

4. **Expiry**
   - Magic links: 15 minutes (configurable)
   - JWT tokens: 7 days (configurable)
   - Implement token refresh for better UX

5. **Rate Limiting**
   - Limit magic link generation (e.g., 3 per hour per phone)
   - Prevent brute force attacks

## Production Checklist

- [ ] Generate strong JWT secret (`openssl rand -base64 64`)
- [ ] Store magic links in Redis (not in-memory)
- [ ] Implement rate limiting on login endpoints
- [ ] Add phone number verification (send OTP first)
- [ ] Enable HTTPS everywhere
- [ ] Set up secure cookie options
- [ ] Implement token refresh flow
- [ ] Add IP-based security (optional)
- [ ] Monitor failed auth attempts
- [ ] Set up 2FA for admin accounts (optional)

## Development

```bash
# Type checking
pnpm type-check
```

## Common Errors

### "Invalid phone number"
- Phone number doesn't match Kenya format (+254...)
- Use `formatPhoneNumber()` first

### "Invalid or expired token"
- JWT token expired (> 7 days by default)
- Implement refresh flow or ask user to login again

### "Invalid or expired link"
- Magic link expired (> 15 minutes by default)
- User clicked link twice (one-time use)
- Ask user to request new link

## License

MIT
