import { relations } from 'drizzle-orm';
import { events, timeSlots } from './events';
import { registrations } from './registrations';
import { staffProfiles } from './staff';
import { eventContentBlocks } from './content';
import { checkinEvents, auditLogs, feedback } from './audit';
import { user, session, account, verification } from './auth';

export * from './events';
export * from './registrations';
export * from './staff';
export * from './content';
export * from './audit';
export * from './auth';

// Relations
export const eventsRelations = relations(events, ({ many }) => ({
  timeSlots: many(timeSlots),
  registrations: many(registrations),
  contentBlocks: many(eventContentBlocks),
}));

export const timeSlotsRelations = relations(timeSlots, ({ one, many }) => ({
  event: one(events, {
    fields: [timeSlots.eventId],
    references: [events.id],
  }),
  registrations: many(registrations),
}));

export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  event: one(events, {
    fields: [registrations.eventId],
    references: [events.id],
  }),
  timeSlot: one(timeSlots, {
    fields: [registrations.slotId],
    references: [timeSlots.id],
  }),
  checkinEvents: many(checkinEvents),
}));

export const staffProfilesRelations = relations(staffProfiles, ({ one }) => ({
  user: one(user, {
    fields: [staffProfiles.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(staffProfiles, {
    fields: [user.id],
    references: [staffProfiles.userId],
  }),
  sessions: many(session),
  accounts: many(account),
}));
