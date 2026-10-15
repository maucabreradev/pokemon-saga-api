import { pgTable, uuid, text, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { forums } from './forums';
import { characters } from './characters';

export const topics = pgTable(
  'topics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    forumId: uuid('forum_id')
      .notNull()
      .references(() => forums.id, { onDelete: 'cascade' }),
    authorCharacterId: uuid('author_character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    body: text('body').notNull(),
    isPinned: boolean('is_pinned').notNull().default(false),
    isLocked: boolean('is_locked').notNull().default(false),
    isDeleted: boolean('is_deleted').notNull().default(false),
    viewCount: integer('view_count').notNull().default(0),
    replyCount: integer('reply_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('topics_forum_idx').on(t.forumId),
    index('topics_author_idx').on(t.authorCharacterId),
    index('topics_created_at_idx').on(t.createdAt),
  ],
);
