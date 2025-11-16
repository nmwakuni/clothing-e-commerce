import { pgTable, uuid, text, boolean, timestamp, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { vendors, categories } from './vendors';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id),

  // Product Information
  name: text('name').notNull(),
  description: text('description'),
  sku: text('sku').unique(),

  // Pricing
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }), // Original price for discounts
  cost: decimal('cost', { precision: 10, scale: 2 }), // Vendor cost (for profit calculation)

  // Media
  images: jsonb('images').default([]), // Array of image URLs

  // Inventory
  stockQuantity: integer('stock_quantity').default(0),
  lowStockThreshold: integer('low_stock_threshold').default(5),
  trackInventory: boolean('track_inventory').default(true),

  // Product Details
  variants: jsonb('variants').default([]), // Size, color, etc.
  specifications: jsonb('specifications').default({}),
  tags: text('tags').array(),

  // SEO & Search
  searchKeywords: text('search_keywords').array(),

  // Metrics
  viewCount: integer('view_count').default(0),
  orderCount: integer('order_count').default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  reviewCount: integer('review_count').default(0),

  // Status
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id, { onDelete: 'cascade' }),

  // Stock Movement
  type: text('type', {
    enum: ['purchase', 'sale', 'return', 'adjustment', 'damaged'],
  }).notNull(),
  quantity: integer('quantity').notNull(),
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),

  // Reference
  referenceType: text('reference_type'), // 'order', 'manual', etc.
  referenceId: uuid('reference_id'),
  notes: text('notes'),

  timestamp: timestamp('timestamp').defaultNow(),
});
