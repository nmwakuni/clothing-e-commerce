import { pgTable, uuid, text, timestamp, integer, decimal, jsonb, boolean } from 'drizzle-orm/pg-core';
import { vendors } from './vendors';
import { customers } from './customers';
import { products } from './products';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').unique().notNull(), // Human-readable: ORD-20250116-001

  // Parties
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id),

  // Order Details
  status: text('status', {
    enum: [
      'pending', 'confirmed', 'processing', 'ready_for_delivery',
      'out_for_delivery', 'delivered', 'cancelled', 'refunded'
    ],
  }).default('pending'),

  // Pricing
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).default('0'),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),

  // Delivery
  deliveryAddress: jsonb('delivery_address').notNull(),
  deliveryInstructions: text('delivery_instructions'),
  deliveryDate: timestamp('delivery_date'),
  deliveryTimeSlot: text('delivery_time_slot'),

  // Payment
  paymentMethod: text('payment_method', {
    enum: ['mpesa', 'airtel_money', 'cash_on_delivery', 'card'],
  }).notNull(),
  paymentStatus: text('payment_status', {
    enum: ['pending', 'paid', 'failed', 'refunded'],
  }).default('pending'),

  // Customer Information
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),

  // Order Type
  orderType: text('order_type', {
    enum: ['individual', 'chama'],
  }).default('individual'),

  // Notes & Communication
  customerNotes: text('customer_notes'),
  vendorNotes: text('vendor_notes'),
  statusHistory: jsonb('status_history').default([]),

  // Cancellation
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
  cancelledBy: text('cancelled_by', { enum: ['customer', 'vendor', 'admin'] }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  confirmedAt: timestamp('confirmed_at'),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),

  // Product Details (snapshot at time of order)
  productName: text('product_name').notNull(),
  productImage: text('product_image'),
  sku: text('sku'),

  // Variant (if applicable)
  variant: jsonb('variant'), // { size: 'M', color: 'Red' }

  // Pricing
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp('created_at').defaultNow(),
});

export const chamaOrders = pgTable('chama_orders', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Group Information
  chamaName: text('chama_name').notNull(),
  organizerId: uuid('organizer_id').notNull().references(() => customers.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id),

  // Order Details
  targetQuantity: integer('target_quantity').notNull(),
  currentQuantity: integer('current_quantity').default(0),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  discountedPrice: decimal('discounted_price', { precision: 10, scale: 2 }),

  // Status
  status: text('status', {
    enum: ['open', 'closed', 'processing', 'completed', 'cancelled'],
  }).default('open'),

  // Delivery
  deliveryAddress: jsonb('delivery_address'),
  deliveryDate: timestamp('delivery_date'),

  // Deadline
  expiresAt: timestamp('expires_at').notNull(),

  // WhatsApp Group Link
  whatsappGroupLink: text('whatsapp_group_link'),

  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const chamaOrderParticipants = pgTable('chama_order_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  chamaOrderId: uuid('chama_order_id').notNull().references(() => chamaOrders.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id),

  quantity: integer('quantity').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),

  // Payment
  paymentStatus: text('payment_status', {
    enum: ['pending', 'paid', 'refunded'],
  }).default('pending'),
  paymentReference: text('payment_reference'),

  joinedAt: timestamp('joined_at').defaultNow(),
});
