import { pgTable, uuid, text, timestamp, decimal, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

/**
 * Boda Boda / Delivery Partner Network
 */

export const deliveryPartners = pgTable('delivery_partners', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Personal Information
  name: text('name').notNull(),
  phoneNumber: text('phone_number').unique().notNull(),
  email: text('email'),
  idNumber: text('id_number').notNull(),

  // Vehicle Information
  vehicleType: text('vehicle_type', {
    enum: ['motorcycle', 'bicycle', 'car', 'van', 'foot'],
  }).notNull(),
  vehicleNumber: text('vehicle_number'), // License plate
  vehicleModel: text('vehicle_model'),

  // Verification Documents
  driverLicense: text('driver_license'),
  insuranceCertificate: text('insurance_certificate'),
  verified: boolean('verified').default(false),
  verifiedAt: timestamp('verified_at'),

  // Coverage Area
  counties: text('counties').array(),
  towns: text('towns').array(),
  operatingRadius: integer('operating_radius').default(10), // km

  // Working Hours
  workingHours: jsonb('working_hours').default({
    monday: { start: '08:00', end: '20:00' },
    tuesday: { start: '08:00', end: '20:00' },
    wednesday: { start: '08:00', end: '20:00' },
    thursday: { start: '08:00', end: '20:00' },
    friday: { start: '08:00', end: '20:00' },
    saturday: { start: '08:00', end: '18:00' },
    sunday: { start: '10:00', end: '16:00' },
  }),

  // Performance Metrics
  totalDeliveries: integer('total_deliveries').default(0),
  successfulDeliveries: integer('successful_deliveries').default(0),
  failedDeliveries: integer('failed_deliveries').default(0),
  averageDeliveryTime: integer('average_delivery_time'), // minutes
  rating: decimal('rating', { precision: 3, scale: 2 }),
  totalReviews: integer('total_reviews').default(0),

  // Earnings
  totalEarnings: decimal('total_earnings', { precision: 10, scale: 2 }).default('0'),
  pendingEarnings: decimal('pending_earnings', { precision: 10, scale: 2 }).default('0'),
  lastPayoutAt: timestamp('last_payout_at'),

  // Status
  isActive: boolean('is_active').default(true),
  isOnline: boolean('is_online').default(false),
  currentLocation: jsonb('current_location'), // { lat, lng }

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  lastActiveAt: timestamp('last_active_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const deliveryAssignments = pgTable('delivery_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  deliveryId: uuid('delivery_id').notNull(),
  partnerId: uuid('partner_id').notNull().references(() => deliveryPartners.id),

  // Assignment Details
  status: text('status', {
    enum: ['assigned', 'accepted', 'rejected', 'completed', 'cancelled'],
  }).default('assigned'),

  // Compensation
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).notNull(),
  partnerEarnings: decimal('partner_earnings', { precision: 10, scale: 2 }).notNull(), // After platform fee

  // Tracking
  assignedAt: timestamp('assigned_at').defaultNow(),
  acceptedAt: timestamp('accepted_at'),
  rejectedAt: timestamp('rejected_at'),
  completedAt: timestamp('completed_at'),
  rejectionReason: text('rejection_reason'),

  // Performance
  actualDeliveryTime: integer('actual_delivery_time'), // minutes
  customerRating: integer('customer_rating'), // 1-5
  customerFeedback: text('customer_feedback'),
});

export const deliveryZones = pgTable('delivery_zones', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Zone Information
  name: text('name').notNull(),
  county: text('county').notNull(),
  town: text('town'),
  boundaries: jsonb('boundaries'), // GeoJSON polygon

  // Pricing
  baseDeliveryFee: decimal('base_delivery_fee', { precision: 10, scale: 2 }).notNull(),
  perKmFee: decimal('per_km_fee', { precision: 10, scale: 2 }),

  // Availability
  isActive: boolean('is_active').default(true),
  averageDeliveryTime: integer('average_delivery_time'), // minutes

  createdAt: timestamp('created_at').defaultNow(),
});

export const deliveryRequests = pgTable('delivery_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull(),

  // Pickup Location
  pickupAddress: jsonb('pickup_address').notNull(),
  pickupLocation: jsonb('pickup_location'), // { lat, lng }
  pickupContact: text('pickup_contact').notNull(),

  // Delivery Location
  deliveryAddress: jsonb('delivery_address').notNull(),
  deliveryLocation: jsonb('delivery_location'), // { lat, lng }
  deliveryContact: text('delivery_contact').notNull(),

  // Request Details
  estimatedDistance: decimal('estimated_distance', { precision: 6, scale: 2 }), // km
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).notNull(),
  priority: text('priority', { enum: ['normal', 'urgent', 'express'] }).default('normal'),

  // Package Details
  packageDescription: text('package_description'),
  packageValue: decimal('package_value', { precision: 10, scale: 2 }),
  specialInstructions: text('special_instructions'),

  // Status
  status: text('status', {
    enum: ['pending', 'searching_partner', 'assigned', 'in_transit', 'delivered', 'failed'],
  }).default('pending'),

  // Assignment
  assignedPartnerId: uuid('assigned_partner_id').references(() => deliveryPartners.id),
  assignmentAttempts: integer('assignment_attempts').default(0),

  // Timestamps
  requestedAt: timestamp('requested_at').defaultNow(),
  assignedAt: timestamp('assigned_at'),
  pickedUpAt: timestamp('picked_up_at'),
  deliveredAt: timestamp('delivered_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
