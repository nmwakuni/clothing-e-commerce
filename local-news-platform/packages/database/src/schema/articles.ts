import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';
import { locations } from './locations';

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  summary: text('summary').notNull(),
  content: text('content').notNull(),

  // Author (can be AI-generated, user-submitted, or admin)
  authorId: uuid('author_id').references(() => users.id),
  authorType: text('author_type', { enum: ['ai', 'journalist', 'admin', 'business'] }).notNull(),

  // Location
  locationId: uuid('location_id')
    .notNull()
    .references(() => locations.id),

  // Categorization
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
  tags: text('tags').array().default([]),

  // Media
  featuredImage: text('featured_image'),
  images: text('images').array().default([]),
  videos: text('videos').array().default([]),

  // Verification
  verificationStatus: text('verification_status', {
    enum: ['pending', 'verified', 'flagged', 'rejected'],
  })
    .notNull()
    .default('pending'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  verificationScore: integer('verification_score'), // AI confidence score 0-100
  verificationNotes: text('verification_notes'),

  // Source tracking
  sourceType: text('source_type', {
    enum: ['ai_aggregated', 'citizen_journalist', 'official', 'partner'],
  }).notNull(),
  sourceUrl: text('source_url'),
  sourceCredibilityScore: integer('source_credibility_score'),

  // Engagement
  viewsCount: integer('views_count').default(0),
  sharesCount: integer('shares_count').default(0),
  commentsCount: integer('comments_count').default(0),
  reactionsCount: integer('reactions_count').default(0),

  // Publishing
  status: text('status', { enum: ['draft', 'published', 'archived'] })
    .notNull()
    .default('draft'),
  publishedAt: timestamp('published_at'),

  // Priority
  isPinned: boolean('is_pinned').default(false),
  isBreaking: boolean('is_breaking').default(false),
  isEmergency: boolean('is_emergency').default(false),

  // SEO
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords').array(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const articleVerificationLogs = pgTable('article_verification_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),

  verifierId: uuid('verifier_id').references(() => users.id),
  verificationType: text('verification_type', { enum: ['ai', 'manual', 'community'] }).notNull(),

  // AI verification results
  aiProvider: text('ai_provider'), // 'claude', 'openai', 'content-moderator'
  credibilityScore: integer('credibility_score'), // 0-100
  fakeNewsScore: integer('fake_news_score'), // 0-100 (higher = more likely fake)
  toxicityScore: integer('toxicity_score'), // 0-100

  // Detailed analysis
  analysis: jsonb('analysis'), // AI analysis JSON
  flags: text('flags').array(), // ['clickbait', 'misleading', 'unverified-sources']

  decision: text('decision', { enum: ['approve', 'reject', 'flag_review'] }).notNull(),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const articleReactions = pgTable('article_reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id')
    .notNull()
    .references(() => articles.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  reactionType: text('reaction_type', {
    enum: ['like', 'love', 'insightful', 'important', 'concerning'],
  }).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
