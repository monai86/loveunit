import { pgTable, uuid, text, timestamp, integer, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
import { events } from './events';

export const eventContentBlocks = pgTable('event_content_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  contentKey: text('content_key').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  altText: text('alt_text'),
  displayOrder: integer('display_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('idx_event_content_key').on(t.eventId, t.contentKey),
]);
