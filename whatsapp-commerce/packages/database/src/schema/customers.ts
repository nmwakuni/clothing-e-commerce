import { pgTable, uuid, text, boolean, timestamp, integer, decimal, jsonb } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Contact Information
  phoneNumber: text('phone_number').unique().notNull(),
  whatsappNumber: text('whatsapp_number'),
  name: text('name'),
  email: text('email'),

  // Location
  county: text('county'),
  town: text('town'),
  deliveryAddresses: jsonb('delivery_addresses').default([]), // Multiple saved addresses
  defaultAddressIndex: integer('default_address_index').default(0),

  // Customer Profile
  customerType: text('customer_type', {
    enum: ['individual', 'chama', 'business'],
  }).default('individual'),

  // Preferences
  preferredCategories: text('preferred_categories').array(),
  preferredPaymentMethod: text('preferred_payment_method', {
    enum: ['mpesa', 'airtel_money', 'cash_on_delivery', 'card'],
  }),

  // Shopping Behavior
  totalOrders: integer('total_orders').default(0),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0'),
  averageOrderValue: decimal('average_order_value', { precision: 10, scale: 2 }),

  // Loyalty & Rewards
  loyaltyPoints: integer('loyalty_points').default(0),
  referralCode: text('referral_code').unique(),
  referredBy: uuid('referred_by').references(() => customers.id),

  // Communication Preferences
  marketingOptIn: boolean('marketing_opt_in').default(true),
  notificationPreferences: jsonb('notification_preferences').default({
    orderUpdates: true,
    promotions: true,
    newProducts: false,
  }),

  // Status
  isActive: boolean('is_active').default(true),
  isBlacklisted: boolean('is_blacklisted').default(false),
  blacklistReason: text('blacklist_reason'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  lastOrderDate: timestamp('last_order_date'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const customerSessions = pgTable('customer_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  phoneNumber: text('phone_number').notNull(),

  // Session State
  currentState: text('current_state', {
    enum: ['browsing', 'viewing_product', 'cart', 'checkout', 'payment', 'idle'],
  }).default('idle'),
  sessionData: jsonb('session_data').default({}), // Cart, current product, etc.

  // Conversation Context
  messages: jsonb('messages').default([]),
  lastMessage: text('last_message'),
  lastMessageAt: timestamp('last_message_at'),

  // Session Management
  startedAt: timestamp('started_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),
});
