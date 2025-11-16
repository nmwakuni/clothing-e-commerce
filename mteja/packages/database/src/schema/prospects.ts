import { pgTable, text, timestamp, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const prospects = pgTable('prospects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Basic info
  name: varchar('name', { length: 255 }).notNull(),
  linkedinUrl: text('linkedin_url').notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),

  // Professional details
  company: varchar('company', { length: 255 }),
  title: varchar('title', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  location: varchar('location', { length: 255 }),

  // Research data (from AI analysis)
  researchData: jsonb('research_data'), // Pain points, interests, recent activity
  painPoints: jsonb('pain_points'), // Array of identified pain points
  interests: jsonb('interests'), // Array of interests
  recentPosts: jsonb('recent_posts'), // Recent LinkedIn posts

  // Tags and organization
  tags: jsonb('tags'), // Array of tags for organization
  listName: varchar('list_name', { length: 100 }), // Custom list/campaign name

  // Status tracking
  status: varchar('status', { length: 50 }).notNull().default('new'), // new, contacted, responded, qualified, closed
  priority: varchar('priority', { length: 20 }).default('medium'), // low, medium, high

  // Engagement tracking
  lastContactedAt: timestamp('last_contacted_at'),
  lastResponseAt: timestamp('last_response_at'),
  responseStatus: varchar('response_status', { length: 50 }), // pending, positive, negative, no_response

  // Notes
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Prospect = typeof prospects.$inferSelect;
export type NewProspect = typeof prospects.$inferInsert;
