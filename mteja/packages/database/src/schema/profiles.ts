import { pgTable, text, timestamp, uuid, varchar, integer, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Input data
  linkedinUrl: text('linkedin_url'),
  industry: varchar('industry', { length: 100 }),
  targetRole: varchar('target_role', { length: 100 }),

  // Current profile data
  currentHeadline: text('current_headline'),
  currentAbout: text('current_about'),
  currentExperience: jsonb('current_experience'), // Array of experience objects
  rawProfileData: jsonb('raw_profile_data'), // Full scraped data

  // Audit results
  auditScore: integer('audit_score'), // 0-100
  auditFeedback: jsonb('audit_feedback'), // Detailed feedback object

  // Optimized suggestions
  optimizedHeadline: text('optimized_headline'),
  optimizedAbout: text('optimized_about'),
  optimizedExperience: jsonb('optimized_experience'),
  suggestions: jsonb('suggestions'), // Array of improvement suggestions

  // AI generation metadata
  aiModel: varchar('ai_model', { length: 100 }).default('claude-3-5-sonnet-20241022'),
  generationTokens: integer('generation_tokens'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
