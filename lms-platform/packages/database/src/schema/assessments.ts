import { pgTable, uuid, varchar, text, integer, decimal, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lessons } from './courses';

// Enums
export const assessmentTypeEnum = pgEnum('assessment_type', ['quiz', 'coding_challenge', 'project', 'essay']);

// Assessments Table
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),

  // Assessment Info
  title: varchar('title', { length: 255 }).notNull(),
  type: assessmentTypeEnum('type').notNull(),

  // Configuration
  questions: jsonb('questions').notNull(),
  /*
    [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is...",
        options: ["A", "B", "C", "D"],
        correct_answer: "B",
        explanation: "Because...",
        points: 10
      },
      {
        id: "q2",
        type: "code",
        question: "Write a function that...",
        starter_code: "def solve():",
        test_cases: [...],
        points: 20
      }
    ]
  */

  // Settings
  timeLimitMinutes: integer('time_limit_minutes'),
  passingScore: integer('passing_score').default(70),
  maxAttempts: integer('max_attempts').default(3),
  randomizeQuestions: boolean('randomize_questions').default(false),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Submissions Table
export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  assessmentId: uuid('assessment_id').references(() => assessments.id, { onDelete: 'cascade' }).notNull(),

  // Submission
  answers: jsonb('answers').notNull(), // Student's answers
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),

  // Grading
  score: decimal('score', { precision: 5, scale: 2 }),
  maxScore: decimal('max_score', { precision: 5, scale: 2 }),
  percentage: decimal('percentage', { precision: 5, scale: 2 }),
  passed: boolean('passed'),
  gradedAt: timestamp('graded_at', { withTimezone: true }),
  gradedBy: uuid('graded_by').references(() => users.id), // NULL for auto-graded

  // Feedback
  feedback: jsonb('feedback'), // Per-question feedback
  aiFeedback: text('ai_feedback'),
  instructorFeedback: text('instructor_feedback'),

  // Attempts
  attemptNumber: integer('attempt_number').notNull(),
  timeTakenMinutes: integer('time_taken_minutes'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
