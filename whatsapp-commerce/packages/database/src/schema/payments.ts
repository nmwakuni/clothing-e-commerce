import { pgTable, uuid, text, timestamp, decimal, jsonb, boolean } from 'drizzle-orm/pg-core';
import { orders } from './orders';
import { customers } from './customers';

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id),

  // Payment Details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('KES'),

  // Payment Method
  paymentMethod: text('payment_method', {
    enum: ['mpesa', 'airtel_money', 'mtn_money', 'orange_money', 'cash_on_delivery', 'card'],
  }).notNull(),

  // Payment Provider
  provider: text('provider'), // 'safaricom', 'airtel', 'paystack', etc.

  // Status
  status: text('status', {
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
  }).default('pending'),

  // Transaction References
  transactionId: text('transaction_id').unique(), // Internal
  externalReference: text('external_reference'), // M-Pesa receipt number, etc.
  mpesaReceiptNumber: text('mpesa_receipt_number'),
  phoneNumber: text('phone_number'),

  // Payment Request (for M-Pesa STK Push)
  checkoutRequestId: text('checkout_request_id'),
  merchantRequestId: text('merchant_request_id'),

  // Response Data
  providerResponse: jsonb('provider_response'),

  // Refunds
  refundedAmount: decimal('refunded_amount', { precision: 10, scale: 2 }).default('0'),
  refundReason: text('refund_reason'),
  refundedAt: timestamp('refunded_at'),

  // Metadata
  metadata: jsonb('metadata').default({}),

  // Timestamps
  initiatedAt: timestamp('initiated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull(),

  // Payout Details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('KES'),

  // Method
  payoutMethod: text('payout_method', {
    enum: ['mpesa', 'bank_transfer', 'airtel_money'],
  }).notNull(),

  // Recipient Details
  recipientPhone: text('recipient_phone'),
  recipientAccountNumber: text('recipient_account_number'),
  recipientBankCode: text('recipient_bank_code'),

  // Status
  status: text('status', {
    enum: ['pending', 'processing', 'completed', 'failed'],
  }).default('pending'),

  // Reference
  transactionId: text('transaction_id').unique(),
  externalReference: text('external_reference'),

  // Period
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),

  // Response
  providerResponse: jsonb('provider_response'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at'),
  completedAt: timestamp('completed_at'),
});
