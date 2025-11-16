import { pgTable, text, timestamp, uuid, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { articles } from './articles';
import { locations } from './locations';

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  content: text('content').notNull(),

  // Threading
  parentCommentId: uuid('parent_comment_id').references(() => comments.id, { onDelete: 'cascade' }),

  // Engagement
  likesCount: integer('likes_count').default(0),
  repliesCount: integer('replies_count').default(0),

  // Moderation
  isEdited: boolean('is_edited').default(false),
  isFlagged: boolean('is_flagged').default(false),
  status: text('status', { enum: ['active', 'hidden', 'removed'] })
    .notNull()
    .default('active'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const polls = pgTable('polls', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),

  question: text('question').notNull(),
  description: text('description'),

  // Options stored as JSON array
  options: text('options').array().notNull(), // ['Option 1', 'Option 2', 'Option 3']

  // Settings
  allowMultipleVotes: boolean('allow_multiple_votes').default(false),
  showResults: text('show_results', { enum: ['always', 'after_vote', 'after_end'] })
    .notNull()
    .default('after_vote'),

  // Timing
  endsAt: timestamp('ends_at'),

  // Metrics
  totalVotes: integer('total_votes').default(0),

  status: text('status', { enum: ['active', 'ended', 'closed'] })
    .notNull()
    .default('active'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pollVotes = pgTable('poll_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  pollId: uuid('poll_id')
    .notNull()
    .references(() => polls.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  optionIndex: integer('option_index').notNull(), // Index of selected option

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emergencyAlerts = pgTable('emergency_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id')
    .notNull()
    .references(() => users.id),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),

  alertType: text('alert_type', {
    enum: ['fire', 'crime', 'accident', 'health', 'weather', 'security', 'other'],
  }).notNull(),

  title: text('title').notNull(),
  message: text('message').notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),

  // Location details
  exactLocation: text('exact_location'),

  // Media
  images: text('images').array().default([]),

  // Verification
  isVerified: boolean('is_verified').default(false),
  verifiedBy: uuid('verified_by').references(() => users.id),

  // Status
  status: text('status', { enum: ['active', 'resolved', 'false_alarm'] })
    .notNull()
    .default('active'),
  resolvedAt: timestamp('resolved_at'),

  // Engagement
  viewsCount: integer('views_count').default(0),
  sharesCount: integer('shares_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const lostAndFound = pgTable('lost_and_found', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),

  type: text('type', { enum: ['lost', 'found'] }).notNull(),

  itemName: text('item_name').notNull(),
  description: text('description').notNull(),
  category: text('category', {
    enum: ['pets', 'documents', 'electronics', 'jewelry', 'keys', 'bags', 'clothing', 'other'],
  }).notNull(),

  // Details
  lastSeenLocation: text('last_seen_location'),
  lastSeenDate: timestamp('last_seen_date'),

  // Media
  images: text('images').array().default([]),

  // Contact
  contactName: text('contact_name').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactEmail: text('contact_email'),

  // Status
  status: text('status', { enum: ['active', 'reunited', 'closed'] })
    .notNull()
    .default('active'),

  // Metrics
  viewsCount: integer('views_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
