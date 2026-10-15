import { pgTable, uuid, text, date, timestamp } from 'drizzle-orm/pg-core';
import { characters } from './characters';

export const charactersProfile = pgTable('characters_profile', {
  characterId: uuid('character_id')
    .notNull()
    .primaryKey()
    .references(() => characters.id, { onDelete: 'cascade' }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  signature: text('signature'),
  birthDate: date('birth_date'),
  customTitle: text('custom_title'),
  location: text('location'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
