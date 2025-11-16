import { pgTable, uuid, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { products } from './products';
import { vendors } from './vendors';
import { customers } from './customers';
import { orders } from './orders';

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Review Target
  reviewType: text('review_type', {
    enum: ['product', 'vendor'],
  }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  vendorId: uuid('vendor_id').references(() => vendors.id, { onDelete: 'cascade' }),

  // Reviewer
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  orderId: uuid('order_id').references(() => orders.id),

  // Review Content
  rating: integer('rating').notNull(), // 1-5
  title: text('title'),
  comment: text('comment'),
  images: text('images').array(),

  // Review Details
  isVerifiedPurchase: boolean('is_verified_purchase').default(false),

  // Moderation
  isApproved: boolean('is_approved').default(false),
  isFlagged: boolean('is_flagged').default(false),
  flagReason: text('flag_reason'),

  // Helpful Count
  helpfulCount: integer('helpful_count').default(0),
  notHelpfulCount: integer('not_helpful_count').default(0),

  // Vendor Response
  vendorResponse: text('vendor_response'),
  vendorRespondedAt: timestamp('vendor_responded_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reviewVotes = pgTable('review_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id').notNull().references(() => reviews.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id),

  isHelpful: boolean('is_helpful').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
});
