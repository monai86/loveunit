import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { events } from './events';
import { timeSlots } from './events';

export const waitlistStatusEnum = pgEnum('waitlist_status_enum', ['WAITING', 'NOTIFIED', 'REMOVED']);

export const waitlist = pgTable('waitlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  slotId: uuid('slot_id').references(() => timeSlots.id, { onDelete: 'cascade' }).notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  phoneNormalized: text('phone_normalized').notNull(),
  status: waitlistStatusEnum('status').default('WAITING').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  notifiedAt: timestamp('notified_at', { withTimezone: true }),
  promotedRegistrationId: uuid('promoted_registration_id'),
});
