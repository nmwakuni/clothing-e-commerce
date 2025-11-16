import { pgTable, uuid, text, timestamp, integer, decimal, date } from 'drizzle-orm/pg-core';
import { vendors } from './vendors';

export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }),

  // Time Period
  date: date('date').notNull(),
  period: text('period', { enum: ['daily', 'weekly', 'monthly'] }).notNull(),

  // Sales Metrics
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).default('0'),
  totalOrders: integer('total_orders').default(0),
  completedOrders: integer('completed_orders').default(0),
  cancelledOrders: integer('cancelled_orders').default(0),
  averageOrderValue: decimal('average_order_value', { precision: 10, scale: 2 }),

  // Customer Metrics
  newCustomers: integer('new_customers').default(0),
  returningCustomers: integer('returning_customers').default(0),
  totalCustomers: integer('total_customers').default(0),

  // Product Metrics
  productViews: integer('product_views').default(0),
  productsOrdered: integer('products_ordered').default(0),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }),

  // Payment Metrics
  mpesaPayments: integer('mpesa_payments').default(0),
  cashPayments: integer('cash_payments').default(0),

  // Delivery Metrics
  successfulDeliveries: integer('successful_deliveries').default(0),
  failedDeliveries: integer('failed_deliveries').default(0),

  createdAt: timestamp('created_at').defaultNow(),
});

export const productAnalytics = pgTable('product_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull(),
  date: date('date').notNull(),

  // Metrics
  views: integer('views').default(0),
  addedToCart: integer('added_to_cart').default(0),
  purchased: integer('purchased').default(0),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0'),

  createdAt: timestamp('created_at').defaultNow(),
});
