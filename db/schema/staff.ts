import { pgTable, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './auth';

// Historical TEAM_LEAD remains for migration compatibility; application roles
// are SUPER_ADMIN, ADMIN (read-only), and STAFF (operations).
export const staffRoleEnum = pgEnum('staff_role_enum', ['STAFF', 'TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN']);

export const staffProfiles = pgTable('staff_profiles', {
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).primaryKey(),
  displayName: text('display_name').notNull(),
  role: staffRoleEnum('role').default('STAFF').notNull(),
  team: text('team'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
