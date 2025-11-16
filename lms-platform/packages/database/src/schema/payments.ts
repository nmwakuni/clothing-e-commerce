import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';

// Enums
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'refunded']);
export const transactionTypeEnum = pgEnum('transaction_type', ['course_purchase', 'subscription', 'payout']);

// Transactions Table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Transaction Info
  type: transactionTypeEnum('type').notNull(),
  amountKes: integer('amount_kes').notNull(),
  currency: varchar('currency', { length: 3 }).default('KES'),

  // Payment Provider
  provider: varchar('provider', { length: 50 }), // mpesa, card, bank
  providerTransactionId: varchar('provider_transaction_id', { length: 255 }),
  providerReference: varchar('provider_reference', { length: 255 }),

  // M-Pesa Specific
  mpesaReceiptNumber: varchar('mpesa_receipt_number', { length: 50 }),
  phoneNumber: varchar('phone_number', { length: 20 }),

  // Status
  status: transactionStatusEnum('status').default('pending'),

  // Related Entities
  courseId: uuid('course_id').references(() => courses.id),
  subscriptionId: uuid('subscription_id'),

  // Metadata
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// Subscriptions Table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Subscription Info
  plan: varchar('plan', { length: 50 }).notNull(), // premium, premium_plus
  billingPeriod: varchar('billing_period', { length: 20 }).default('monthly'), // monthly, yearly

  // Pricing
  amountKes: integer('amount_kes').notNull(),

  // Status
  status: varchar('status', { length: 20 }).default('active'), // active, cancelled, expired, past_due
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),

  // Cancellation
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),

  // Payment Method
  paymentMethod: varchar('payment_method', { length: 50 }), // mpesa, card
  mpesaPhoneNumber: varchar('mpesa_phone_number', { length: 20 }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Payouts Table (for course creators)
export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  creatorId: uuid('creator_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Payout Info
  amountKes: integer('amount_kes').notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, processing, completed, failed

  // Period
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),

  // Payment Details
  paymentMethod: varchar('payment_method', { length: 50 }), // mpesa, bank_transfer
  mpesaPhoneNumber: varchar('mpesa_phone_number', { length: 20 }),
  bankDetails: jsonb('bank_details'),

  // Processing
  processedAt: timestamp('processed_at', { withTimezone: true }),
  transactionReference: varchar('transaction_reference', { length: 255 }),

  // Metadata
  metadata: jsonb('metadata'), // Breakdown by course, etc.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Payout = typeof payouts.$inferSelect;
export type NewPayout = typeof payouts.$inferInsert;
