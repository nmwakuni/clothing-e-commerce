# @lms/auth

Authentication system using Better Auth with Google OAuth.

## Features

- 🔐 Email/Password authentication
- 🔑 Google OAuth integration
- 👤 Extended user profiles (role, level, XP)
- 🍪 Session management with cookies
- 🔄 Auto session refresh
- 📱 Phone number support

## Installation

```bash
pnpm install
```

## Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Better Auth
BETTER_AUTH_SECRET=your_random_secret_key
BETTER_AUTH_URL=http://localhost:3000
```

## Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

## Usage

### API Routes (Hono)

```typescript
import { auth } from '@lms/auth';
import { Hono } from 'hono';

const app = new Hono();

// Mount auth routes
app.all('/api/auth/*', (c) => auth.handler(c.req.raw));

// Protected route
app.get('/api/me', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({ user: session.user });
});
```

### Client-Side (React)

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

// Sign in with Google
await authClient.signIn.social({
  provider: 'google',
  callbackURL: '/dashboard',
});

// Sign in with email/password
await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await authClient.signOut();

// Get session
const { data: session } = authClient.useSession();
```

### Middleware Protection

```typescript
import { auth } from '@lms/auth';

app.use('/api/courses/*', async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', session.user);
  await next();
});
```

## User Object

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  phoneNumber?: string;
  role: 'student' | 'creator' | 'admin';
  level: number;
  xpPoints: number;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Session Management

Sessions automatically:

- Expire after 7 days
- Refresh every 24 hours
- Cache in cookies for 5 minutes
- Support server and client validation

## Security Features

- Secure HTTP-only cookies
- CSRF protection
- Rate limiting (configure in Better Auth)
- Password hashing with bcrypt
- Session token rotation

## Migration from Phone Auth

To migrate existing phone-based users:

```typescript
// Link phone number to Google account
await auth.api.linkAccount({
  userId: user.id,
  provider: 'phone',
  providerAccountId: phoneNumber,
});
```

## Customization

Extend user fields in `src/index.ts`:

```typescript
user: {
  additionalFields: {
    organization: {
      type: 'string',
      required: false,
    },
    bio: {
      type: 'string',
      required: false,
    },
  },
}
```
