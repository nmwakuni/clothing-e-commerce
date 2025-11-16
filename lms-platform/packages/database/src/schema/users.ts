import { pgTable, uuid, varchar, text, boolean, integer, timestamp, pgEnum, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'creator', 'admin']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'premium', 'premium_plus']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Basic Info
  phoneNumber: varchar('phone_number', { length: 20 }).notNull().unique(),
  email: varchar('email', { length: 255 }).unique(),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),

  // Preferences
  language: varchar('language', { length: 10 }).default('en'),
  timezone: varchar('timezone', { length: 50 }).default('Africa/Nairobi'),
  learningStyle: varchar('learning_style', { length: 20 }), // visual, auditory, kinesthetic

  // Account Status
  role: userRoleEnum('role').default('student'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free'),
  subscriptionExpiresAt: timestamp('subscription_expires_at', { withTimezone: true }),

  // Gamification
  xpPoints: integer('xp_points').default(0),
  level: integer('level').default(1),
  streakDays: integer('streak_days').default(0),
  lastActivityDate: timestamp('last_activity_date', { mode: 'date' }),

  // Settings
  whatsappNotifications: boolean('whatsapp_notifications').default(true),
  emailNotifications: boolean('email_notifications').default(false),
  smsNotifications: boolean('sms_notifications').default(false),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
