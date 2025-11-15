import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';
import { users, therapists } from './users';

// Appointments between users and therapists
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  therapistId: uuid('therapist_id')
    .notNull()
    .references(() => therapists.id, { onDelete: 'cascade' }),

  // Scheduling
  scheduledAt: timestamp('scheduled_at').notNull(),
  duration: integer('duration').default(50), // minutes
  timezone: text('timezone').notNull(),

  // Session type
  sessionType: text('session_type', { enum: ['video', 'audio', 'chat'] }).notNull(),

  // Status
  status: text('status', {
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
  }).notNull().default('scheduled'),

  // Meeting links
  meetingUrl: text('meeting_url'),

  // Payment
  price: integer('price').notNull(),
  paid: boolean('paid').default(false),
  paymentId: text('payment_id'),

  // Notes
  therapistNotes: text('therapist_notes'), // Encrypted
  userFeedback: text('user_feedback'),
  userRating: integer('user_rating'), // 1-5

  // Cancellation
  cancelledBy: uuid('cancelled_by').references(() => users.id),
  cancellationReason: text('cancellation_reason'),
  cancelledAt: timestamp('cancelled_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mental health resources
export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),

  title: text('title').notNull(),
  description: text('description').notNull(),
  content: text('content'),

  // Type
  resourceType: text('resource_type', {
    enum: ['article', 'video', 'audio', 'exercise', 'worksheet', 'hotline', 'app'],
  }).notNull(),

  // Categorization
  category: text('category', {
    enum: ['anxiety', 'depression', 'trauma', 'relationships', 'self-care', 'crisis', 'general'],
  }).notNull(),
  tags: text('tags').array().default([]),

  // Media
  url: text('url'),
  thumbnailUrl: text('thumbnail_url'),
  fileUrl: text('file_url'),

  // For hotlines
  phoneNumber: text('phone_number'),
  country: text('country'),
  available247: boolean('available_247').default(false),
  languages: text('languages').array(),

  // Ratings
  viewsCount: integer('views_count').default(0),
  helpfulCount: integer('helpful_count').default(0),

  // Publishing
  published: boolean('published').default(true),
  featured: boolean('featured').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Support groups
export const supportGroups = pgTable('support_groups', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: text('name').notNull(),
  description: text('description').notNull(),

  // Group type
  groupType: text('group_type', {
    enum: ['depression', 'anxiety', 'trauma', 'grief', 'addiction', 'lgbtq', 'general'],
  }).notNull(),

  // Moderation
  moderatorId: uuid('moderator_id').references(() => users.id),
  rules: text('rules').array().default([]),

  // Privacy
  isPrivate: boolean('is_private').default(false),
  requiresApproval: boolean('requires_approval').default(true),

  // Limits
  maxMembers: integer('max_members').default(100),
  currentMembers: integer('current_members').default(0),

  // Meetings
  meetingSchedule: text('meeting_schedule'), // e.g., "Weekly on Wednesdays at 7 PM EAT"
  meetingUrl: text('meeting_url'),

  // Status
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const groupMembers = pgTable('group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => supportGroups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  role: text('role', { enum: ['member', 'moderator', 'admin'] }).default('member'),

  // Status
  status: text('status', { enum: ['pending', 'active', 'banned'] }).default('pending'),

  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const groupMessages = pgTable('group_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => supportGroups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  content: text('content').notNull(),

  // Moderation
  flagged: boolean('flagged').default(false),
  flagReason: text('flag_reason'),
  hidden: boolean('hidden').default(false),

  // Reactions
  supportCount: integer('support_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
