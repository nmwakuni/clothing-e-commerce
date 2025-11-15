import { pgTable, text, timestamp, uuid, real, integer } from 'drizzle-orm/pg-core';

export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g., "Westlands"
  slug: text('slug').notNull().unique(), // e.g., "westlands"

  // Geographic data
  city: text('city').notNull(), // e.g., "Nairobi"
  county: text('county').notNull(), // e.g., "Nairobi County"
  country: text('country').notNull().default('Kenya'),

  // Coordinates for map features
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),

  // Hierarchy
  parentLocationId: uuid('parent_location_id').references(() => locations.id),
  locationType: text('location_type', {
    enum: ['country', 'county', 'city', 'estate', 'neighborhood'],
  }).notNull(),

  // Metadata
  description: text('description'),
  population: integer('population'),
  activeUsersCount: integer('active_users_count').default(0),
  newsArticlesCount: integer('news_articles_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userLocationSubscriptions = pgTable('user_location_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

import { users } from './users';
