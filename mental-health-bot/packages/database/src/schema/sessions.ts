import { pgTable, text, timestamp, integer, boolean, uuid, jsonb } from 'drizzle-orm/pg-core';
import { users, therapists } from './users';

// Therapy sessions with AI or human therapists
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  therapistId: uuid('therapist_id').references(() => therapists.id), // null for AI sessions

  sessionType: text('session_type', { enum: ['ai', 'human_video', 'human_chat'] }).notNull(),

  // Session content (encrypted)
  messages: jsonb('messages').notNull().default([]), // Array of {role, content, timestamp}

  // Session metadata
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
  duration: integer('duration'), // in minutes

  // AI analysis
  sentiment: text('sentiment', { enum: ['positive', 'neutral', 'negative', 'crisis'] }),
  topics: text('topics').array(), // ['anxiety', 'work-stress', 'relationships']
  recommendations: text('recommendations').array(),

  // Crisis detection
  crisisDetected: boolean('crisis_detected').default(false),
  crisisLevel: text('crisis_level', { enum: ['none', 'mild', 'moderate', 'severe', 'critical'] }).default('none'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Daily mood tracking
export const moods = pgTable('moods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Mood rating
  moodLevel: integer('mood_level').notNull(), // 1-10 scale
  moodType: text('mood_type', {
    enum: ['happy', 'sad', 'anxious', 'angry', 'calm', 'stressed', 'energetic', 'tired', 'hopeful', 'hopeless'],
  }).notNull(),

  // Context
  activities: text('activities').array(), // ['exercise', 'work', 'socializing']
  triggers: text('triggers').array(),
  symptoms: text('symptoms').array(), // ['headache', 'insomnia', 'appetite-loss']

  // Notes
  notes: text('notes'),

  // Location and weather (for pattern analysis)
  location: text('location'),
  weather: text('weather'),

  // Time of day
  timeOfDay: text('time_of_day', { enum: ['morning', 'afternoon', 'evening', 'night'] }),

  loggedAt: timestamp('logged_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Journal entries
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  title: text('title'),
  content: text('content').notNull(),

  // Entry type
  entryType: text('entry_type', {
    enum: ['freeform', 'gratitude', 'reflection', 'goal', 'dream', 'worry'],
  }).default('freeform'),

  // Audio/voice entry
  audioUrl: text('audio_url'),
  transcription: text('transcription'),

  // AI insights
  sentiment: text('sentiment'),
  themes: text('themes').array(),
  aiSummary: text('ai_summary'),

  // Privacy
  isPrivate: boolean('is_private').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Crisis events and interventions
export const crisisEvents = pgTable('crisis_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').references(() => sessions.id),

  // Crisis details
  crisisType: text('crisis_type', {
    enum: ['suicidal_ideation', 'self_harm', 'panic_attack', 'severe_distress', 'psychotic_episode'],
  }).notNull(),
  severity: text('severity', { enum: ['mild', 'moderate', 'severe', 'critical'] }).notNull(),

  // Detection
  detectedBy: text('detected_by', { enum: ['ai', 'user_reported', 'therapist', 'emergency_contact'] }).notNull(),
  triggerMessage: text('trigger_message'), // The message that triggered detection

  // Intervention
  interventionType: text('intervention_type', {
    enum: ['ai_support', 'hotline_provided', 'emergency_services', 'therapist_contacted', 'safety_plan'],
  }).array().default([]),
  interventionNotes: text('intervention_notes'),

  // Follow-up
  followUpScheduled: boolean('follow_up_scheduled').default(false),
  followUpAt: timestamp('follow_up_at'),
  resolvedAt: timestamp('resolved_at'),
  resolution: text('resolution'),

  // Emergency contacts notified
  contactsNotified: text('contacts_notified').array().default([]),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Safety plans
export const safetyPlans = pgTable('safety_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Warning signs
  warningSign s: text('warning_signs').array().notNull(),

  // Coping strategies
  internalCoping: text('internal_coping').array(), // Things I can do alone
  socialSupport: text('social_support').array(), // People/places that distract
  professionalContacts: jsonb('professional_contacts'), // [{name, phone, role}]
  emergencyContacts: jsonb('emergency_contacts'), // [{name, phone, relationship}]

  // Environment safety
  environmentSafety: text('environment_safety').array(), // Remove means, etc.

  // Reasons to live
  reasonsToLive: text('reasons_to_live').array(),

  // Active/archived
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
