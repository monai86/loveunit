import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth';

export const staffApplicationStatusEnum = pgEnum('staff_application_status_enum', [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
]);

/** Public requests to join the operational staff team. They never create a
 * login until a Super Admin approves the request. */
export const staffApplications = pgTable('staff_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  referenceCode: text('reference_code').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  team: text('team').notNull(),
  status: staffApplicationStatusEnum('status').default('PENDING').notNull(),
  rejectionReason: text('rejection_reason'),
  reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('staff_applications_email_idx').on(table.email),
  index('staff_applications_status_created_at_idx').on(table.status, table.createdAt),
  uniqueIndex('staff_applications_pending_email_unique')
    .on(table.email)
    .where(sql`${table.status} = 'PENDING'`),
]);

export type StaffApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
