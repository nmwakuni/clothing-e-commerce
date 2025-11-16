import { pgTable, uuid, varchar, integer, decimal, boolean, timestamp, jsonb, pgEnum, text } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses, lessons } from './courses';

// Enums
export const enrollmentStatusEnum = pgEnum('enrollment_status', ['active', 'paused', 'completed', 'dropped']);
export const progressStatusEnum = pgEnum('progress_status', ['not_started', 'in_progress', 'completed']);
export const paymentTypeEnum = pgEnum('payment_type', ['free', 'one_time', 'subscription']);

// Enrollments Table
export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),

  // Enrollment Info
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow(),
  source: varchar('source', { length: 50 }), // whatsapp, web, mobile, referral

  // Progress
  progressPercentage: decimal('progress_percentage', { precision: 5, scale: 2 }).default('0'),
  lessonsCompleted: integer('lessons_completed').default(0),
  currentLessonId: uuid('current_lesson_id').references(() => lessons.id),

  // Completion
  completedAt: timestamp('completed_at', { withTimezone: true }),
  certificateId: uuid('certificate_id'), // Will reference certificates table
  finalScore: decimal('final_score', { precision: 5, scale: 2 }),

  // Payment
  paymentType: paymentTypeEnum('payment_type'),
  amountPaidKes: integer('amount_paid_kes').default(0),
  transactionId: uuid('transaction_id'), // Will reference transactions table

  // Learning
  timeSpentMinutes: integer('time_spent_minutes').default(0),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),

  // Status
  status: enrollmentStatusEnum('status').default('active'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Progress Table
export const progress = pgTable('progress', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  enrollmentId: uuid('enrollment_id').references(() => enrollments.id, { onDelete: 'cascade' }).notNull(),

  // Progress
  status: progressStatusEnum('status').default('not_started'),
  progressPercentage: decimal('progress_percentage', { precision: 5, scale: 2 }).default('0'),

  // Completion
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  timeSpentMinutes: integer('time_spent_minutes').default(0),

  // Assessment
  score: decimal('score', { precision: 5, scale: 2 }),
  attempts: integer('attempts').default(0),
  passed: boolean('passed'),

  // Engagement
  notes: text('notes'),
  bookmarked: boolean('bookmarked').default(false),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Certificates Table
export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),

  // Certificate Info
  certificateNumber: varchar('certificate_number', { length: 50 }).notNull().unique(),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow(),

  // Verification
  blockchainHash: varchar('blockchain_hash', { length: 255 }),
  verificationUrl: text('verification_url'),

  // Performance
  finalScore: decimal('final_score', { precision: 5, scale: 2 }),
  completionTimeDays: integer('completion_time_days'),

  // Shareable
  publicUrl: text('public_url'),
  isPublic: boolean('is_public').default(true),

  // Metadata
  metadata: jsonb('metadata'), // Skills earned, projects completed, etc.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
export type Progress = typeof progress.$inferSelect;
export type NewProgress = typeof progress.$inferInsert;
export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;
