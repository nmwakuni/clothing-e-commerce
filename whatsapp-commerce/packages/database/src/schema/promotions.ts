import { pgTable, uuid, text, timestamp, integer, decimal, boolean, jsonb } from 'drizzle-orm/pg-core';
import { vendors } from './vendors';

export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }),

  // Promotion Details
  name: text('name').notNull(),
  description: text('description'),
  code: text('code').unique(),

  // Type
  type: text('type', {
    enum: ['percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping'],
  }).notNull(),

  // Discount
  discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }),

  // Buy X Get Y
  buyQuantity: integer('buy_quantity'),
  getQuantity: integer('get_quantity'),

  // Conditions
  minimumPurchase: decimal('minimum_purchase', { precision: 10, scale: 2 }),
  maximumDiscount: decimal('maximum_discount', { precision: 10, scale: 2 }),

  // Applicable Products
  applicableProducts: text('applicable_products').array(), // Product IDs
  applicableCategories: text('applicable_categories').array(),

  // Usage Limits
  usageLimit: integer('usage_limit'), // Total uses
  usageLimitPerCustomer: integer('usage_limit_per_customer'),
  currentUsageCount: integer('current_usage_count').default(0),

  // Validity
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),

  // Status
  isActive: boolean('is_active').default(true),
  isPublic: boolean('is_public').default(true), // False for private codes

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const promotionUsage = pgTable('promotion_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  promotionId: uuid('promotion_id').notNull().references(() => promotions.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull(),
  orderId: uuid('order_id').notNull(),

  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),

  usedAt: timestamp('used_at').defaultNow(),
});
