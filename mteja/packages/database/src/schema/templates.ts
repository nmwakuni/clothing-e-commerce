import { pgTable, text, timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // null = system template

  // Template details
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  industry: varchar('industry', { length: 100 }), // tech, finance, healthcare, etc.
  messageType: varchar('message_type', { length: 50 }).notNull(), // connection_request, followup, cold_email
  channel: varchar('channel', { length: 50 }).notNull(), // linkedin, email, whatsapp

  // Content
  subject: text('subject'), // For emails
  template: text('template').notNull(), // Template with variables like {{name}}, {{company}}
  variables: text('variables'), // JSON array of required variables

  // Metadata
  isSystem: boolean('is_system').default(false), // System templates vs user-created
  isActive: boolean('is_active').default(true),
  usageCount: varchar('usage_count', { length: 10 }).default('0'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
