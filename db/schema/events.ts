import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum, index } from 'drizzle-orm/pg-core';

export const eventStatusEnum = pgEnum('event_status_enum', [
  'DRAFT',
  'PUBLISHED',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'COMPLETED',
  'ARCHIVED',
]);

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  description: text('description').notNull(),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  venueName: text('venue_name').notNull(),
  venueDetail: text('venue_detail').notNull(),
  registrationOpenAt: timestamp('registration_open_at', { withTimezone: true }).notNull(),
  registrationCloseAt: timestamp('registration_close_at', { withTimezone: true }).notNull(),
  status: eventStatusEnum('status').default('REGISTRATION_OPEN').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const timeSlots = pgTable('time_slots', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  capacity: integer('capacity').default(35).notNull(),
  bookedCount: integer('booked_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_time_slots_event_active').on(t.eventId, t.isActive),
]);
