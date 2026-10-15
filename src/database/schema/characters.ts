import { pgTable, uuid, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const characterStatusEnum = pgEnum('character_status', ['active', 'banned', 'deleted']);

export const characters = pgTable('characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  readableId: text('readable_id').notNull().unique(),
  publicName: text('public_name').notNull(),
  status: characterStatusEnum('status').notNull().default('active'),
  isMainCharacter: boolean('is_main_character').notNull().default(false),
  readableIdChanged: boolean('readable_id_changed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
