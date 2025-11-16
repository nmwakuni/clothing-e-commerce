import { pgTable, uuid, text, boolean, timestamp, integer, decimal, jsonb } from 'drizzle-orm/pg-core';

export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Business Information
  businessName: text('business_name').notNull(),
  ownerName: text('owner_name').notNull(),
  phoneNumber: text('phone_number').unique().notNull(),
  email: text('email').unique(),

  // Business Details
  description: text('description'),
  category: text('category', {
    enum: ['fashion', 'electronics', 'food', 'produce', 'beauty', 'home', 'crafts', 'other'],
  }).notNull(),
  logo: text('logo'),

  // Location
  county: text('county'),
  town: text('town'),
  address: text('address'),
  deliveryRadius: integer('delivery_radius').default(5), // km

  // Verification
  verified: boolean('verified').default(false),
  verificationDocuments: jsonb('verification_documents').default([]),

  // Subscription
  subscriptionTier: text('subscription_tier', {
    enum: ['free', 'pro', 'enterprise'],
  }).default('free'),
  subscriptionExpiry: timestamp('subscription_expiry'),

  // Limits based on tier
  productLimit: integer('product_limit').default(10), // Free: 10, Pro: unlimited

  // Business Metrics
  totalSales: decimal('total_sales', { precision: 12, scale: 2 }).default('0'),
  totalOrders: integer('total_orders').default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  totalReviews: integer('total_reviews').default(0),

  // Settings
  settings: jsonb('settings').default({
    acceptsOrders: true,
    autoReply: true,
    workingHours: { start: '08:00', end: '18:00' },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  }),

  // Status
  isActive: boolean('is_active').default(true),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  parentId: uuid('parent_id'), // For subcategories

  // Display
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow(),
});
