import { pgTable, timestamp, uuid, varchar, integer, date } from 'drizzle-orm/pg-core';
import { users } from './users';

export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Metric details
  metricType: varchar('metric_type', { length: 100 }).notNull(), // profile_audit, prospect_research, message_sent, message_response, etc.
  metricCategory: varchar('metric_category', { length: 50 }).notNull(), // profile, outreach, payment, usage

  // Values
  value: integer('value').notNull().default(1),
  metadata: varchar('metadata', { length: 500 }), // JSON string with additional context

  // Time tracking
  date: date('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const responseMetrics = pgTable('response_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Message details
  messageType: varchar('message_type', { length: 50 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  templateId: uuid('template_id'),

  // Performance metrics
  sent: integer('sent').default(0),
  delivered: integer('delivered').default(0),
  opened: integer('opened').default(0),
  clicked: integer('clicked').default(0),
  responded: integer('responded').default(0),

  // Response sentiment
  positiveResponses: integer('positive_responses').default(0),
  neutralResponses: integer('neutral_responses').default(0),
  negativeResponses: integer('negative_responses').default(0),

  // Time period
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Analytics = typeof analytics.$inferSelect;
export type NewAnalytics = typeof analytics.$inferInsert;
export type ResponseMetrics = typeof responseMetrics.$inferSelect;
export type NewResponseMetrics = typeof responseMetrics.$inferInsert;
