import { pgTable, uuid, text, timestamp, boolean, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { events, timeSlots } from './events';

export const participantTypeEnum = pgEnum('participant_type_enum', ['STUDENT', 'STAFF', 'GENERAL_PUBLIC']);
export const donationExperienceEnum = pgEnum('donation_experience_enum', ['FIRST_TIME', 'RETURNING']);
export const registrationSourceEnum = pgEnum('registration_source_enum', ['ONLINE', 'WALK_IN', 'ADMIN']);
export const registrationStatusEnum = pgEnum('registration_status_enum', [
  'REGISTERED',
  'CHECKED_IN',
  'IN_PROCESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export const registrations = pgTable('registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  registrationCode: text('registration_code').notNull().unique(),
  qrToken: text('qr_token').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  phoneNormalized: text('phone_normalized').notNull(),
  email: text('email'),
  participantType: participantTypeEnum('participant_type').notNull(),
  faculty: text('faculty'),
  academicYear: text('academic_year'),
  donationExperience: donationExperienceEnum('donation_experience').notNull(),
  prChannel: text('pr_channel'),
  slotId: uuid('slot_id').references(() => timeSlots.id, { onDelete: 'set null' }),
  status: registrationStatusEnum('status').default('REGISTERED').notNull(),
  source: registrationSourceEnum('source').default('ONLINE').notNull(),
  privacyAccepted: boolean('privacy_accepted').default(true).notNull(),
  registeredAt: timestamp('registered_at', { withTimezone: true }).defaultNow().notNull(),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_registrations_event_phone').on(t.eventId, t.phoneNormalized),
  index('idx_registrations_event_id').on(t.eventId),
  index('idx_registrations_event_status').on(t.eventId, t.status),
  index('idx_registrations_event_source').on(t.eventId, t.source),
  index('idx_registrations_slot_id').on(t.slotId),
  index('idx_registrations_registered_at').on(t.registeredAt),
]);
