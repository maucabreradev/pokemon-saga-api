import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { NotFoundError } from '../common/exceptions/app-errors';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { categories } from '../database/schema/categories';
import { forums } from '../database/schema/forums';
import { topics } from '../database/schema/topics';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateForumDto } from './dto/create-forum.dto';

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

export interface ForumBreadcrumbItem {
  id: string;
  name: string;
}

export interface ForumDetail {
  id: string;
  name: string;
  description: string | null;
  visibility: 'public' | 'registered' | 'characters_only';
  displayOrder: number;
  subForums: ForumTreeNode[];
  breadcrumb: ForumBreadcrumbItem[];
  topicCount: number;
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

  async getForumDetail(id: string): Promise<ForumDetail> {
    const [forum] = await this.db
      .select({
        id: forums.id,
        parentForumId: forums.parentForumId,
        name: forums.name,
        description: forums.description,
        visibility: forums.visibility,
        displayOrder: forums.displayOrder,
      })
      .from(forums)
      .where(and(eq(forums.id, id), eq(forums.visibility, 'public')))
      .limit(1);

    if (!forum) {
      throw new NotFoundError('Forum', id);
    }

    const childRows = await this.db
      .select({
        id: forums.id,
        name: forums.name,
        description: forums.description,
        visibility: forums.visibility,
        displayOrder: forums.displayOrder,
      })
      .from(forums)
      .where(and(eq(forums.parentForumId, id), eq(forums.visibility, 'public')))
      .orderBy(asc(forums.displayOrder));

    const breadcrumb: ForumBreadcrumbItem[] = [];
    const visited = new Set<string>([forum.id]);
    let parentId: string | null = forum.parentForumId;
    while (parentId !== null) {
      if (visited.has(parentId)) {
        break;
      }
      visited.add(parentId);

      const [parent] = await this.db
        .select({
          id: forums.id,
          parentForumId: forums.parentForumId,
          name: forums.name,
          visibility: forums.visibility,
        })
        .from(forums)
        .where(eq(forums.id, parentId))
        .limit(1);

      // Stop the trail at missing or non-public parents so the
      // breadcrumb never leaks forums the requester cannot see.
      if (!parent || parent.visibility !== 'public') {
        break;
      }

      breadcrumb.unshift({ id: parent.id, name: parent.name });
      parentId = parent.parentForumId;
    }

    const topicRows = await this.db
      .select({ id: topics.id })
      .from(topics)
      .where(and(eq(topics.forumId, id), eq(topics.isDeleted, false), isNull(topics.deletedAt)));

    return {
      id: forum.id,
      name: forum.name,
      description: forum.description,
      visibility: forum.visibility,
      displayOrder: forum.displayOrder,
      subForums: childRows.map((child) => ({ ...child, forums: [] })),
      breadcrumb,
      topicCount: topicRows.length,
    };
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryTreeNode> {
    const [top] = await this.db
      .select({ displayOrder: categories.displayOrder })
      .from(categories)
      .orderBy(desc(categories.displayOrder))
      .limit(1);

    const now = new Date();

    const [created] = await this.db
      .insert(categories)
      .values({
        name: dto.name,
        description: dto.description ?? null,
        visibility: dto.visibility ?? 'public',
        displayOrder: (top?.displayOrder ?? -1) + 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        visibility: categories.visibility,
        displayOrder: categories.displayOrder,
      });

    return { ...created, forums: [] };
  }

  async createForum(dto: CreateForumDto) {
    const [category] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, dto.categoryId))
      .limit(1);

    if (!category) {
      throw new NotFoundError('Category', dto.categoryId);
    }

    if (dto.parentForumId !== undefined) {
      const [parent] = await this.db
        .select({ id: forums.id, categoryId: forums.categoryId })
        .from(forums)
        .where(eq(forums.id, dto.parentForumId))
        .limit(1);

      if (!parent || parent.categoryId !== dto.categoryId) {
        throw new NotFoundError('Forum', dto.parentForumId);
      }
    }

    const parentId = dto.parentForumId ?? null;
    const [topSibling] = await this.db
      .select({ displayOrder: forums.displayOrder })
      .from(forums)
      .where(
        parentId === null
          ? and(eq(forums.categoryId, dto.categoryId), isNull(forums.parentForumId))
          : and(eq(forums.categoryId, dto.categoryId), eq(forums.parentForumId, parentId)),
      )
      .orderBy(desc(forums.displayOrder))
      .limit(1);

    const now = new Date();

    const [created] = await this.db
      .insert(forums)
      .values({
        categoryId: dto.categoryId,
        parentForumId: parentId,
        name: dto.name,
        description: dto.description ?? null,
        visibility: dto.visibility ?? 'public',
        displayOrder: (topSibling?.displayOrder ?? -1) + 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: forums.id,
        categoryId: forums.categoryId,
        parentForumId: forums.parentForumId,
        name: forums.name,
        description: forums.description,
        visibility: forums.visibility,
        displayOrder: forums.displayOrder,
      });

    return created;
  }
}
