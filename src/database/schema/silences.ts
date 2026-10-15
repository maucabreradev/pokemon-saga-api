import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { characters } from './characters';

export const silences = pgTable(
  'silences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('silences_character_idx').on(t.characterId)],
);
