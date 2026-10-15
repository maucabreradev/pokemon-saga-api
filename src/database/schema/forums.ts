import { pgTable, uuid, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { categories } from './categories';
import { forumVisibilityEnum } from './categories';

export const forums = pgTable(
  'forums',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    parentForumId: uuid('parent_forum_id'),
    name: text('name').notNull(),
    description: text('description'),
    visibility: forumVisibilityEnum('visibility').notNull().default('public'),
    displayOrder: integer('display_order').notNull().default(0),
    isLocked: boolean('is_locked').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('forums_category_idx').on(t.categoryId),
    index('forums_parent_idx').on(t.parentForumId),
  ],
);

export const forumsRelations = relations(forums, ({ one, many }) => ({
  parent: one(forums, {
    fields: [forums.parentForumId],
    references: [forums.id],
  }),
  children: many(forums),
  category: one(categories, {
    fields: [forums.categoryId],
    references: [categories.id],
  }),
}));
