import { pgTable, uuid, timestamp, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { characters } from './characters';

export const reactionTypeEnum = pgEnum('reaction_type', [
  'like',
  'love',
  'laugh',
  'wow',
  'sad',
  'angry',
]);

export const targetTypeEnum = pgEnum('target_type', ['topic', 'post']);

export const reactions = pgTable(
  'reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    targetType: targetTypeEnum('target_type').notNull(),
    targetId: uuid('target_id').notNull(),
    reactionType: reactionTypeEnum('reaction_type').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('reactions_unique_idx').on(t.characterId, t.targetType, t.targetId, t.reactionType),
    index('reactions_target_idx').on(t.targetType, t.targetId),
  ],
);
