import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { events } from './events';
import { registrations } from './registrations';
import { user } from './auth';

export const checkinEvents = pgTable('checkin_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  registrationId: uuid('registration_id').references(() => registrations.id, { onDelete: 'cascade' }).notNull(),
  action: text('action').notNull(),
  performedBy: text('performed_by').references(() => user.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: text('actor_id').references(() => user.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const feedback = pgTable('feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  registrationId: uuid('registration_id').references(() => registrations.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(),
  knowledgeRating: integer('knowledge_rating'),
  experienceRating: integer('experience_rating'),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
