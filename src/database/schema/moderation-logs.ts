import { pgTable, uuid, text, integer, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { characters } from './characters';

export const moderationActionEnum = pgEnum('moderation_action', [
  'ban',
  'unban',
  'delete',
  'silence',
  'unsilence',
]);

export const moderationTargetTypeEnum = pgEnum('moderation_target_type', [
  'character',
  'topic',
  'post',
]);

export const moderationLogs = pgTable(
  'moderation_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moderatorCharacterId: uuid('moderator_character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    action: moderationActionEnum('action').notNull(),
    targetType: moderationTargetTypeEnum('target_type').notNull(),
    targetId: uuid('target_id').notNull(),
    reason: text('reason').notNull(),
    durationMinutes: integer('duration_minutes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('moderation_logs_moderator_idx').on(t.moderatorCharacterId),
    index('moderation_logs_target_idx').on(t.targetType, t.targetId),
  ],
);
