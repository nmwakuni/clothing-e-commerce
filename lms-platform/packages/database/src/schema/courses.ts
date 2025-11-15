import { pgTable, uuid, varchar, text, integer, decimal, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Enums
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced']);
export const courseStatusEnum = pgEnum('course_status', ['draft', 'published', 'archived']);
export const contentTypeEnum = pgEnum('content_type', ['video', 'text', 'interactive', 'quiz', 'project']);

// Courses Table
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Basic Info
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  shortDescription: varchar('short_description', { length: 500 }),

  // Content
  thumbnailUrl: text('thumbnail_url'),
  previewVideoUrl: text('preview_video_url'),
  language: varchar('language', { length: 10 }).default('en'),
  difficulty: difficultyEnum('difficulty').default('beginner'),

  // Creator
  creatorId: uuid('creator_id').references(() => users.id, { onDelete: 'cascade' }),

  // Categorization
  category: varchar('category', { length: 100 }),
  tags: text('tags').array(),

  // Pricing
  priceKes: integer('price_kes').default(0),
  isPremiumOnly: boolean('is_premium_only').default(false),

  // Stats
  totalLessons: integer('total_lessons').default(0),
  estimatedHours: decimal('estimated_hours', { precision: 5, scale: 2 }),
  enrollmentCount: integer('enrollment_count').default(0),
  completionCount: integer('completion_count').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),

  // Learning Outcomes
  learningOutcomes: text('learning_outcomes').array(),
  prerequisites: text('prerequisites').array(),

  // Status
  status: courseStatusEnum('status').default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Lessons Table
export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),

  // Content
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),

  // Lesson Content
  contentType: contentTypeEnum('content_type').notNull(),
  contentData: jsonb('content_data'),
  /*
    For video: { url, duration, subtitles }
    For text: { markdown, reading_time }
    For interactive: { exercise_type, code_template, tests }
    For quiz: { questions: [...] }
    For project: { brief, requirements, rubric }
  */

  // Resources
  attachments: jsonb('attachments'),
  externalResources: jsonb('external_resources'),

  // Ordering
  sectionName: varchar('section_name', { length: 100 }),
  orderIndex: integer('order_index').notNull(),

  // Completion Criteria
  estimatedMinutes: integer('estimated_minutes'),
  passingScore: integer('passing_score'),
  requiresSubmission: boolean('requires_submission').default(false),

  // AI Tutor
  aiEnabled: boolean('ai_enabled').default(true),
  aiContext: text('ai_context'),

  // Status
  isPreview: boolean('is_preview').default(false),
  isPublished: boolean('is_published').default(false),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Course Reviews Table
export const courseReviews = pgTable('course_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),

  // Review
  rating: integer('rating').notNull(), // 1-5
  reviewText: text('review_text'),

  // Helpful
  helpfulCount: integer('helpful_count').default(0),

  // Status
  isVerifiedPurchase: boolean('is_verified_purchase').default(false),
  isPublished: boolean('is_published').default(true),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
export type CourseReview = typeof courseReviews.$inferSelect;
export type NewCourseReview = typeof courseReviews.$inferInsert;
