import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { categories } from '../database/schema/categories';
import { forums } from '../database/schema/forums';

export interface ForumTreeNode {
  id: string;
  name: string;
  description: string | null;
  visibility: 'public' | 'registered' | 'characters_only';
  displayOrder: number;
  forums: ForumTreeNode[];
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  description: string | null;
  visibility: 'public' | 'registered' | 'characters_only';
  displayOrder: number;
  forums: ForumTreeNode[];
}

@Injectable()
export class ForumsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getTree(): Promise<CategoryTreeNode[]> {
    // Guest view: only public categories and forums. Authenticated
    // visibility filtering (registered / characters_only) lands in TASK-047,
    // because the global AuthGuard skips @Public() routes without a user.
    const categoryRows = await this.db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        visibility: categories.visibility,
        displayOrder: categories.displayOrder,
      })
      .from(categories)
      .where(eq(categories.visibility, 'public'))
      .orderBy(asc(categories.displayOrder));

    const forumRows = await this.db
      .select({
        id: forums.id,
        categoryId: forums.categoryId,
        parentForumId: forums.parentForumId,
        name: forums.name,
        description: forums.description,
        visibility: forums.visibility,
        displayOrder: forums.displayOrder,
      })
      .from(forums)
      .where(eq(forums.visibility, 'public'))
      .orderBy(asc(forums.displayOrder));

    const tree: CategoryTreeNode[] = categoryRows.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      visibility: category.visibility,
      displayOrder: category.displayOrder,
      forums: [],
    }));
    const categoryById = new Map(tree.map((category) => [category.id, category]));

    const nodeById = new Map<string, ForumTreeNode>();
    for (const row of forumRows) {
      nodeById.set(row.id, {
        id: row.id,
        name: row.name,
        description: row.description,
        visibility: row.visibility,
        displayOrder: row.displayOrder,
        forums: [],
      });
    }

    for (const row of forumRows) {
      const node = nodeById.get(row.id);
      if (!node) {
        continue;
      }

      const parent = row.parentForumId !== null ? nodeById.get(row.parentForumId) : undefined;
      if (parent) {
        parent.forums.push(node);
        continue;
      }

      // Root forum, or orphan whose parent was filtered out (not public).
      // Attach to its category so no public content is lost.
      categoryById.get(row.categoryId)?.forums.push(node);
    }

    return tree;
  }
}
