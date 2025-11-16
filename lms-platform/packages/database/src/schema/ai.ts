import { pgTable, uuid, varchar, text, integer, decimal, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lessons } from './courses';

// Enums
export const conversationStatusEnum = pgEnum('conversation_status', ['active', 'inactive', 'blocked']);
export const messageDirectionEnum = pgEnum('message_direction', ['inbound', 'outbound']);
export const messageContentTypeEnum = pgEnum('message_content_type', ['text', 'image', 'video', 'audio', 'document']);

// Conversations Table (WhatsApp)
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // WhatsApp Info
  whatsappConversationId: varchar('whatsapp_conversation_id', { length: 255 }).unique(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),

  // Context
  currentContext: varchar('current_context', { length: 50 }), // browsing, learning, support, onboarding
  contextData: jsonb('context_data'), // Current course, lesson, etc.

  // Status
  status: conversationStatusEnum('status').default('active'),

  // Metadata
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Messages Table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Message Info
  direction: messageDirectionEnum('direction').notNull(),
  contentType: messageContentTypeEnum('content_type').notNull(),

  // Content
  content: text('content'),
  mediaUrl: text('media_url'),
  mediaMimeType: varchar('media_mime_type', { length: 100 }),

  // WhatsApp
  whatsappMessageId: varchar('whatsapp_message_id', { length: 255 }),
  whatsappStatus: varchar('whatsapp_status', { length: 20 }), // sent, delivered, read, failed

  // AI
  isAiGenerated: boolean('is_ai_generated').default(false),
  aiModel: varchar('ai_model', { length: 50 }), // claude-3-sonnet, gpt-4, etc.

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// AI Sessions Table
export const aiSessions = pgTable('ai_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),

  // Session Info
  sessionType: varchar('session_type', { length: 50 }), // tutoring, assessment_help, general_question
  topic: varchar('topic', { length: 255 }),

  // AI Model
  model: varchar('model', { length: 50 }), // claude-3-sonnet-20240229
  totalTokens: integer('total_tokens').default(0),
  costUsd: decimal('cost_usd', { precision: 10, scale: 6 }).default('0'),

  // Effectiveness
  helpfulRating: integer('helpful_rating'), // 1-5
  studentFeedback: text('student_feedback'),

  // Metadata
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  durationMinutes: integer('duration_minutes'),
});

// Feedback Table
export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }),

  // Feedback
  type: varchar('type', { length: 50 }), // lesson_quality, ai_tutor, technical_issue, feature_request
  rating: integer('rating'), // 1-5
  comment: text('comment'),

  // Context
  context: jsonb('context'), // Additional context about the feedback

  // Status
  isResolved: boolean('is_resolved').default(false),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type AiSession = typeof aiSessions.$inferSelect;
export type NewAiSession = typeof aiSessions.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
