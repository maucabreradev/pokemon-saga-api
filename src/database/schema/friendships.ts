import { pgTable, uuid, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { characters } from './characters';

export const friendshipStatusEnum = pgEnum('friendship_status', ['pending', 'accepted', 'blocked']);

export const friendships = pgTable(
  'friendships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requesterCharacterId: uuid('requester_character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    addresseeCharacterId: uuid('addressee_character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    status: friendshipStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('friendships_requester_idx').on(t.requesterCharacterId),
    index('friendships_addressee_idx').on(t.addresseeCharacterId),
  ],
);
