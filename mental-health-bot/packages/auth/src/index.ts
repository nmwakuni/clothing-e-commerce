import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@nafsi/database';

export const createAuth = (databaseUrl: string, baseUrl: string) => {
  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    baseURL: baseUrl,
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Enable for production
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day (session extends after this period)
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Cache session for 5 minutes
      },
    },
    user: {
      additionalFields: {
        isAnonymous: {
          type: 'boolean',
          defaultValue: true,
        },
        displayName: {
          type: 'string',
          required: false,
        },
        phoneNumber: {
          type: 'string',
          required: false,
        },
        riskLevel: {
          type: 'string',
          defaultValue: 'low',
        },
        hasSafetyPlan: {
          type: 'boolean',
          defaultValue: false,
        },
      },
    },
  });
};

export type Auth = ReturnType<typeof createAuth>;
