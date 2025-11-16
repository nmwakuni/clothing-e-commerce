import { pgTable, text, timestamp, uuid, varchar, decimal, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Payment details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('KES'), // KES, UGX, NGN, GHS, USD

  // Plan details
  plan: varchar('plan', { length: 50 }).notNull(), // starter, pro, agency
  billingPeriod: varchar('billing_period', { length: 50 }).notNull(), // monthly, yearly

  // Payment method
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // mpesa, pesapal, stripe
  paymentProvider: varchar('payment_provider', { length: 50 }).notNull(), // mpesa, pesapal_mpesa, pesapal_card, stripe

  // Payment gateway IDs
  transactionId: varchar('transaction_id', { length: 255 }), // External transaction ID
  checkoutRequestId: varchar('checkout_request_id', { length: 255 }), // M-Pesa checkout ID
  pesapalOrderId: varchar('pesapal_order_id', { length: 255 }), // Pesapal order ID
  pesapalTrackingId: varchar('pesapal_tracking_id', { length: 255 }), // Pesapal tracking ID
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }), // Stripe payment intent

  // Customer details
  phoneNumber: varchar('phone_number', { length: 50 }), // For M-Pesa
  email: varchar('email', { length: 255 }),

  // Status
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, completed, failed, refunded
  failureReason: text('failure_reason'),

  // Receipt
  receiptNumber: varchar('receipt_number', { length: 255 }),

  // Metadata
  metadata: text('metadata'), // JSON string with additional data

  // Timestamps
  paidAt: timestamp('paid_at'),
  refundedAt: timestamp('refunded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Subscription details
  plan: varchar('plan', { length: 50 }).notNull(), // starter, pro, agency
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, cancelled, expired, past_due
  billingPeriod: varchar('billing_period', { length: 50 }).notNull(), // monthly, yearly

  // Billing
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('KES'),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(), // mpesa, pesapal, stripe

  // Period tracking
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),

  // External IDs
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),

  // Auto-renewal
  autoRenew: boolean('auto_renew').default(true),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  cancelledAt: timestamp('cancelled_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
