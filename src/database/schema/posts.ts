import { pgTable, uuid, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { topics } from './topics';
import { characters } from './characters';

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topicId: uuid('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    parentPostId: uuid('parent_post_id'),
    authorCharacterId: uuid('author_character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    isDeleted: boolean('is_deleted').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('posts_topic_idx').on(t.topicId),
    index('posts_author_idx').on(t.authorCharacterId),
    index('posts_parent_idx').on(t.parentPostId),
  ],
);
