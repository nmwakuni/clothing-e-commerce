import { pgTable, uuid, text, timestamp, decimal, jsonb, boolean } from 'drizzle-orm/pg-core';
import { orders } from './orders';

export const deliveries = pgTable('deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),

  // Delivery Status
  status: text('status', {
    enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'],
  }).default('pending'),

  // Delivery Person
  driverName: text('driver_name'),
  driverPhone: text('driver_phone'),
  vehicleType: text('vehicle_type', {
    enum: ['motorcycle', 'bicycle', 'car', 'van', 'foot'],
  }),
  vehicleNumber: text('vehicle_number'),

  // Address
  pickupAddress: jsonb('pickup_address').notNull(),
  deliveryAddress: jsonb('delivery_address').notNull(),

  // Tracking
  currentLocation: jsonb('current_location'),
  estimatedDeliveryTime: timestamp('estimated_delivery_time'),
  trackingUpdates: jsonb('tracking_updates').default([]),

  // Proof of Delivery
  deliveredTo: text('delivered_to'),
  recipientSignature: text('recipient_signature'), // Image URL
  deliveryPhoto: text('delivery_photo'), // Image URL
  deliveryNotes: text('delivery_notes'),

  // Failed Delivery
  failureReason: text('failure_reason'),
  attemptCount: integer('attempt_count').default(0),

  // Timestamps
  assignedAt: timestamp('assigned_at'),
  pickedUpAt: timestamp('picked_up_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const deliveryPartners = pgTable('delivery_partners', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Partner Information
  name: text('name').notNull(),
  phoneNumber: text('phone_number').unique().notNull(),
  email: text('email'),

  // Vehicle
  vehicleType: text('vehicle_type', {
    enum: ['motorcycle', 'bicycle', 'car', 'van'],
  }).notNull(),
  vehicleNumber: text('vehicle_number'),

  // Coverage Area
  counties: text('counties').array(),
  towns: text('towns').array(),

  // Verification
  verified: boolean('verified').default(false),
  idNumber: text('id_number'),
  driverLicense: text('driver_license'),

  // Performance
  totalDeliveries: integer('total_deliveries').default(0),
  successfulDeliveries: integer('successful_deliveries').default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }),

  // Status
  isActive: boolean('is_active').default(true),
  isOnline: boolean('is_online').default(false),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  lastActiveAt: timestamp('last_active_at'),
});
