import { pgTable, text, timestamp, uuid, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  type: text('type', {
    enum: [
      'new_article',
      'comment_reply',
      'submission_approved',
      'submission_rejected',
      'emergency_alert',
      'poll_created',
      'event_reminder',
      'achievement',
      'weekly_digest',
    ],
  }).notNull(),

  title: text('title').notNull(),
  message: text('message').notNull(),

  // Link to related resource
  actionUrl: text('action_url'),
  metadata: jsonb('metadata'),

  // Status
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),

  // Delivery channels
  deliveredViaEmail: boolean('delivered_via_email').default(false),
  deliveredViaWhatsApp: boolean('delivered_via_whatsapp').default(false),
  deliveredViaSMS: boolean('delivered_via_sms').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const whatsappMessages = pgTable('whatsapp_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  phoneNumber: text('phone_number').notNull(),

  // Message details
  messageType: text('message_type', {
    enum: ['news_digest', 'breaking_news', 'alert', 'reminder', 'response'],
  }).notNull(),
  content: text('content').notNull(),

  // WhatsApp API details
  whatsappMessageId: text('whatsapp_message_id'),
  status: text('status', { enum: ['queued', 'sent', 'delivered', 'read', 'failed'] })
    .notNull()
    .default('queued'),

  // Error handling
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),

  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

import { integer } from 'drizzle-orm/pg-core';
