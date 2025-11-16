import { pgTable, text, timestamp, uuid, integer, boolean, real } from 'drizzle-orm/pg-core';
import { users } from './users';
import { locations } from './locations';

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),

  // Basic info
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  category: text('category', {
    enum: [
      'restaurant',
      'retail',
      'services',
      'health',
      'education',
      'entertainment',
      'automotive',
      'real_estate',
      'other',
    ],
  }).notNull(),

  // Contact
  phoneNumber: text('phone_number').notNull(),
  email: text('email'),
  website: text('website'),
  whatsappNumber: text('whatsapp_number'),

  // Physical location
  address: text('address').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),

  // Media
  logo: text('logo'),
  coverImage: text('cover_image'),
  images: text('images').array().default([]),

  // Operating hours
  operatingHours: text('operating_hours'), // JSON string

  // Subscription
  subscriptionTier: text('subscription_tier', { enum: ['free', 'basic', 'premium'] })
    .notNull()
    .default('free'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),

  // Features based on tier
  canPostSponsoredContent: boolean('can_post_sponsored_content').default(false),
  canPostEvents: boolean('can_post_events').default(false),
  canPostClassifieds: boolean('can_post_classifieds').default(false),
  featuredListing: boolean('featured_listing').default(false),

  // Metrics
  viewsCount: integer('views_count').default(0),
  clicksCount: integer('clicks_count').default(0),
  ratingsCount: integer('ratings_count').default(0),
  averageRating: real('average_rating').default(0),

  // Status
  isVerified: boolean('is_verified').default(false),
  status: text('status', { enum: ['active', 'suspended', 'pending_review'] })
    .notNull()
    .default('pending_review'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const businessReviews = pgTable('business_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  rating: integer('rating').notNull(), // 1-5
  title: text('title'),
  comment: text('comment').notNull(),

  // Helpful votes
  helpfulCount: integer('helpful_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sponsoredContent = pgTable('sponsored_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id')
    .notNull()
    .references(() => businesses.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),

  title: text('title').notNull(),
  content: text('content').notNull(),
  ctaText: text('cta_text'), // Call to action
  ctaUrl: text('cta_url'),

  // Media
  image: text('image'),

  // Targeting
  targetLocations: text('target_locations').array(),
  targetCategories: text('target_categories').array(),

  // Campaign
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  budget: integer('budget'), // In KES
  costPerClick: integer('cost_per_click'),

  // Metrics
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),

  // Status
  status: text('status', { enum: ['draft', 'active', 'paused', 'completed'] })
    .notNull()
    .default('draft'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id, { onDelete: 'cascade' }),
  organizerId: uuid('organizer_id').references(() => users.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),

  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category', {
    enum: ['community', 'business', 'sports', 'entertainment', 'education', 'health', 'other'],
  }).notNull(),

  // Event details
  venue: text('venue').notNull(),
  address: text('address').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),

  // Timing
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),

  // Media
  image: text('image'),

  // Registration
  requiresRegistration: boolean('requires_registration').default(false),
  registrationUrl: text('registration_url'),
  maxAttendees: integer('max_attendees'),
  currentAttendees: integer('current_attendees').default(0),

  // Pricing
  isFree: boolean('is_free').default(true),
  ticketPrice: integer('ticket_price'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const classifieds = pgTable('classifieds', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),

  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category', {
    enum: [
      'for_sale',
      'wanted',
      'jobs',
      'services',
      'housing',
      'vehicles',
      'electronics',
      'furniture',
      'other',
    ],
  }).notNull(),

  price: integer('price'),
  isNegotiable: boolean('is_negotiable').default(true),

  // Contact
  contactName: text('contact_name').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactEmail: text('contact_email'),

  // Media
  images: text('images').array().default([]),

  // Status
  status: text('status', { enum: ['active', 'sold', 'expired', 'removed'] })
    .notNull()
    .default('active'),

  expiresAt: timestamp('expires_at').notNull(),

  // Metrics
  viewsCount: integer('views_count').default(0),
  contactsCount: integer('contacts_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
