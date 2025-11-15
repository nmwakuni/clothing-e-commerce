import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique(),
  phoneNumber: text('phone_number').unique(),
  name: text('name'),

  // Privacy & Anonymity
  isAnonymous: boolean('is_anonymous').default(true),
  displayName: text('display_name'), // Can be pseudonym

  // Demographics (optional)
  age: integer('age'),
  gender: text('gender'),
  country: text('country'),
  language: text('language').default('en'),

  // Mental Health Profile
  primaryConcerns: text('primary_concerns').array(), // ['anxiety', 'depression', 'stress']
  triggers: text('triggers').array(),
  copingStrategies: text('coping_strategies').array(),

  // Risk Assessment
  riskLevel: text('risk_level', { enum: ['low', 'medium', 'high', 'critical'] }).default('low'),
  lastRiskAssessment: timestamp('last_risk_assessment'),
  hasSafetyPlan: boolean('has_safety_plan').default(false),

  // Subscription
  subscriptionTier: text('subscription_tier', { enum: ['free', 'premium', 'professional'] })
    .notNull()
    .default('free'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),

  // Engagement
  totalSessions: integer('total_sessions').default(0),
  lastSessionAt: timestamp('last_session_at'),
  streakDays: integer('streak_days').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const therapists = pgTable('therapists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Professional Info
  licenseNumber: text('license_number').notNull(),
  licenseType: text('license_type').notNull(), // e.g., "Clinical Psychologist"
  yearsExperience: integer('years_experience'),

  // Specializations
  specializations: text('specializations').array(), // ['trauma', 'CBT', 'anxiety']
  languages: text('languages').array().notNull(),

  // Availability
  available: boolean('available').default(true),
  maxClientsPerWeek: integer('max_clients_per_week').default(10),
  currentClientCount: integer('current_client_count').default(0),

  // Pricing
  sessionPrice: integer('session_price'), // In local currency cents
  acceptsInsurance: boolean('accepts_insurance').default(false),

  // Location
  country: text('country').notNull(),
  city: text('city'),
  timezone: text('timezone').notNull(),

  // Ratings
  averageRating: integer('average_rating').default(0),
  totalRatings: integer('total_ratings').default(0),

  // Verification
  verified: boolean('verified').default(false),
  verifiedAt: timestamp('verified_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
