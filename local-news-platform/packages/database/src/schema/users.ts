import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  phoneNumber: text('phone_number').unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  role: text('role', { enum: ['reader', 'journalist', 'business', 'admin'] })
    .notNull()
    .default('reader'),

  // For citizen journalists
  journalistVerified: boolean('journalist_verified').default(false),
  reputationScore: integer('reputation_score').default(0),
  storiesSubmitted: integer('stories_submitted').default(0),
  storiesApproved: integer('stories_approved').default(0),

  // Location preferences
  preferredNeighborhood: text('preferred_neighborhood'),

  // Premium subscription
  isPremium: boolean('is_premium').default(false),
  premiumExpiresAt: timestamp('premium_expires_at'),

  // Engagement
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Notification preferences
  emailNotifications: boolean('email_notifications').default(true),
  whatsappNotifications: boolean('whatsapp_notifications').default(true),
  smsNotifications: boolean('sms_notifications').default(false),

  // Content preferences
  preferredLanguage: text('preferred_language', { enum: ['en', 'sw'] }).default('en'),
  categoriesFollowed: text('categories_followed').array(),

  // Frequency
  dailyDigest: boolean('daily_digest').default(false),
  breakingNewsAlerts: boolean('breaking_news_alerts').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
