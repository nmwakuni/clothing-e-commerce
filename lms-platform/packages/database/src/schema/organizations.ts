import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Enums
export const orgPlanEnum = pgEnum('org_plan', ['starter', 'growth', 'enterprise']);
export const orgStatusEnum = pgEnum('org_status', ['active', 'suspended', 'cancelled']);

// Organizations Table
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Basic Info
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  logoUrl: text('logo_url'),

  // Contact
  adminUserId: uuid('admin_user_id').references(() => users.id),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),

  // Subscription
  plan: orgPlanEnum('plan').default('starter'),
  maxSeats: integer('max_seats'),
  seatsUsed: integer('seats_used').default(0),

  // Billing
  billingEmail: varchar('billing_email', { length: 255 }),
  billingAddress: jsonb('billing_address'),

  // Customization
  customDomain: varchar('custom_domain', { length: 255 }),
  brandColors: jsonb('brand_colors'),
  whiteLabelEnabled: boolean('white_label_enabled').default(false),

  // Status
  status: orgStatusEnum('status').default('active'),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Teams Table
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),

  // Team Info
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // Settings
  autoEnrollCourses: boolean('auto_enroll_courses').default(false),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Team Members Table
export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

  // Role
  role: varchar('role', { length: 50 }).default('member'), // member, manager, admin

  // Status
  status: varchar('status', { length: 20 }).default('active'), // active, inactive

  // Metadata
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
});

// Learning Paths Table (for organizations to create custom curricula)
export const learningPaths = pgTable('learning_paths', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Relationships
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),

  // Path Info
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // Courses (ordered array of course IDs)
  courseIds: uuid('course_ids').array().notNull(),

  // Requirements
  isRequired: boolean('is_required').default(false),
  deadlineDate: timestamp('deadline_date', { withTimezone: true }),

  // Stats
  enrolledCount: integer('enrolled_count').default(0),
  completedCount: integer('completed_count').default(0),

  // Status
  isActive: boolean('is_active').default(true),

  // Metadata
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Type exports
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type LearningPath = typeof learningPaths.$inferSelect;
export type NewLearningPath = typeof learningPaths.$inferInsert;
