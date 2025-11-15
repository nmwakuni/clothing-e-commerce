import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { locations } from './locations';

export const userSubmissions = pgTable('user_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),

  // Submission content
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category', {
    enum: [
      'breaking',
      'crime',
      'politics',
      'business',
      'events',
      'community',
      'sports',
      'entertainment',
      'health',
      'education',
      'environment',
    ],
  }).notNull(),

  // Media
  images: text('images').array().default([]),
  videos: text('videos').array().default([]),

  // Metadata
  happenedAt: timestamp('happened_at'),
  exactLocation: text('exact_location'), // Street address or landmark
  witnesses: integer('witnesses'),

  // Review status
  status: text('status', { enum: ['pending', 'under_review', 'approved', 'rejected'] })
    .notNull()
    .default('pending'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),

  // If approved, reference to published article
  publishedArticleId: uuid('published_article_id'),

  // Verification
  aiVerificationScore: integer('ai_verification_score'),
  aiFlags: text('ai_flags').array(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const submissionReports = pgTable('submission_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => userSubmissions.id, { onDelete: 'cascade' }),
  reporterId: uuid('reporter_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  reason: text('reason', {
    enum: ['fake_news', 'inappropriate', 'spam', 'duplicate', 'other'],
  }).notNull(),
  details: text('details'),

  status: text('status', { enum: ['pending', 'reviewed', 'actioned'] })
    .notNull()
    .default('pending'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
