import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  linkedinUrl: text('linkedin_url'),

  // Subscription
  plan: varchar('plan', { length: 50 }).notNull().default('free'), // free, starter, pro, agency
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('inactive'), // inactive, active, cancelled, past_due
  subscriptionId: varchar('subscription_id', { length: 255 }),
  currentPeriodEnd: timestamp('current_period_end'),

  // Payment
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  mpesaPhone: varchar('mpesa_phone', { length: 50 }),

  // Usage limits
  profileAuditsUsed: varchar('profile_audits_used', { length: 10 }).default('0'),
  prospectsResearchedThisMonth: varchar('prospects_researched_this_month', { length: 10 }).default('0'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
