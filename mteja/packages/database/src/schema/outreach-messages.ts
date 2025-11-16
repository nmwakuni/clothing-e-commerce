import { pgTable, text, timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { prospects } from './prospects';
import { users } from './users';

export const outreachMessages = pgTable('outreach_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  prospectId: uuid('prospect_id')
    .notNull()
    .references(() => prospects.id, { onDelete: 'cascade' }),

  // Message details
  type: varchar('type', { length: 50 }).notNull(), // connection_request, followup_1, followup_2, followup_3, cold_email
  channel: varchar('channel', { length: 50 }).notNull(), // linkedin, email, whatsapp
  subject: text('subject'), // For emails
  message: text('message').notNull(),

  // Generation metadata
  templateUsed: varchar('template_used', { length: 100 }),
  personalizationData: text('personalization_data'), // What data was used for personalization

  // Tracking
  status: varchar('status', { length: 50 }).notNull().default('draft'), // draft, sent, delivered, opened, clicked, responded
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  respondedAt: timestamp('responded_at'),

  // Response tracking
  responseReceived: boolean('response_received').default(false),
  responseText: text('response_text'),
  responseSentiment: varchar('response_sentiment', { length: 50 }), // positive, neutral, negative

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type OutreachMessage = typeof outreachMessages.$inferSelect;
export type NewOutreachMessage = typeof outreachMessages.$inferInsert;
