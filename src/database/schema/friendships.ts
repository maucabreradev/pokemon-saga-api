import { sql } from 'drizzle-orm';
import { check, pgTable, uuid, timestamp, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
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
    uniqueIndex('friendships_pair_idx').on(t.requesterCharacterId, t.addresseeCharacterId),
    index('friendships_requester_idx').on(t.requesterCharacterId),
    index('friendships_addressee_idx').on(t.addresseeCharacterId),
    // The unique pair index does not forbid a character being its own friend, and a
    // self-pair would match both direction queries of the list endpoint.
    check('friendships_no_self_check', sql`${t.requesterCharacterId} <> ${t.addresseeCharacterId}`),
  ],
);
