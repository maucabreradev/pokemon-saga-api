import { Inject, Injectable } from '@nestjs/common';
import { SQL, and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';
import { UserRole } from '../auth/decorators/roles.decorator';
import { ForbiddenError, NotFoundError, ValidationError } from '../common/exceptions/app-errors';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { sanitizeHtml } from '../common/utils/sanitize-html';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { characters } from '../database/schema/characters';
import { forums } from '../database/schema/forums';
import { posts } from '../database/schema/posts';
import { topics } from '../database/schema/topics';
import { ForumsService } from '../forums/forums.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { ListTopicsQueryDto } from './dto/list-topics-query.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

export interface TopicListItem {
  id: string;
  title: string;
  forumId: string;
  forumName: string;
  authorCharacterId: string;
  authorName: string;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
}

export interface PaginatedTopics {
  data: TopicListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TopicPostItem {
  id: string;
  topicId: string;
  parentPostId: string | null;
  authorCharacterId: string;
  authorName: string;
  body: string;
  createdAt: Date;
}

export interface TopicDetail {
  topic: {
    id: string;
    title: string;
    body: string;
    forumId: string;
    forumName: string;
    authorCharacterId: string;
    authorName: string;
    isPinned: boolean;
    isLocked: boolean;
    viewCount: number;
    createdAt: Date;
  };
  posts: {
    data: TopicPostItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatedTopic {
  id: string;
  forumId: string;
  authorCharacterId: string;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: Date;
}

// An edit returns the same projection createTopic already returns, so the
// response shape stays identical between creating and editing a topic.
export type UpdatedTopic = CreatedTopic;

const MAX_LIMIT = 50;

@Injectable()
export class TopicsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly forumsService: ForumsService,
  ) {}

  async listTopics(query: ListTopicsQueryDto, userId?: string): Promise<PaginatedTopics> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, MAX_LIMIT);

    if (query.forumId !== undefined) {
      try {
        await this.forumsService.assertForumAccess(query.forumId, userId);
      } catch (error) {
        // Guests must not learn non-public forums exist (same mask as GET /forums/:id).
        if (userId === undefined && error instanceof ForbiddenError) {
          throw new NotFoundError('Forum', query.forumId);
        }
        throw error;
      }
    }

    const conditions: SQL[] = [eq(topics.isDeleted, false), isNull(topics.deletedAt)];

    if (query.forumId !== undefined) {
      conditions.push(eq(topics.forumId, query.forumId));
    }

    if (query.authorCharacterId !== undefined) {
      conditions.push(eq(topics.authorCharacterId, query.authorCharacterId));
    }

    if (userId === undefined) {
      // @Public() routes carry no user (AuthGuard skips them), so this is the
      // guest view. Wiring an authenticated viewer stays future work alongside
      // optional auth, same as the forums tree filtering deferred in TASK-047.
      conditions.push(eq(forums.visibility, 'public'));
    } else {
      const [character] = await this.db
        .select({ id: characters.id })
        .from(characters)
        .where(
          and(
            eq(characters.userId, userId),
            eq(characters.status, 'active'),
            isNull(characters.deletedAt),
          ),
        )
        .limit(1);

      conditions.push(
        character
          ? inArray(forums.visibility, ['public', 'registered', 'characters_only'])
          : inArray(forums.visibility, ['public', 'registered']),
      );
    }

    const orderColumn =
      query.sort === 'replies'
        ? topics.replyCount
        : query.sort === 'views'
          ? topics.viewCount
          : topics.createdAt;

    const matching = await this.db
      .select({ id: topics.id })
      .from(topics)
      .innerJoin(forums, eq(topics.forumId, forums.id))
      .where(and(...conditions));
    const total = matching.length;

    const data = await this.db
      .select({
        id: topics.id,
        title: topics.title,
        forumId: topics.forumId,
        forumName: forums.name,
        authorCharacterId: topics.authorCharacterId,
        authorName: characters.publicName,
        replyCount: topics.replyCount,
        viewCount: topics.viewCount,
        isPinned: topics.isPinned,
        isLocked: topics.isLocked,
        createdAt: topics.createdAt,
      })
      .from(topics)
      .innerJoin(forums, eq(topics.forumId, forums.id))
      .innerJoin(characters, eq(topics.authorCharacterId, characters.id))
      .where(and(...conditions))
      .orderBy(desc(orderColumn))
      .limit(limit)
      .offset((page - 1) * limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getTopicDetail(
    id: string,
    query: PaginationQueryDto,
    userId?: string,
  ): Promise<TopicDetail> {
    const [topic] = await this.db
      .select({
        id: topics.id,
        title: topics.title,
        body: topics.body,
        forumId: topics.forumId,
        forumName: forums.name,
        authorCharacterId: topics.authorCharacterId,
        authorName: characters.publicName,
        isPinned: topics.isPinned,
        isLocked: topics.isLocked,
        viewCount: topics.viewCount,
        createdAt: topics.createdAt,
      })
      .from(topics)
      .innerJoin(forums, eq(topics.forumId, forums.id))
      .innerJoin(characters, eq(topics.authorCharacterId, characters.id))
      .where(and(eq(topics.id, id), eq(topics.isDeleted, false), isNull(topics.deletedAt)))
      .limit(1);

    if (!topic) {
      throw new NotFoundError('Topic', id);
    }

    try {
      await this.forumsService.assertForumAccess(topic.forumId, userId);
    } catch (error) {
      // Guests must not learn topics in non-public forums exist.
      if (userId === undefined && error instanceof ForbiddenError) {
        throw new NotFoundError('Topic', id);
      }
      throw error;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const nextViewCount = topic.viewCount + 1;

    await this.db
      .update(topics)
      .set({ viewCount: nextViewCount, updatedAt: new Date() })
      .where(eq(topics.id, id));

    const matching = await this.db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.topicId, id), eq(posts.isDeleted, false), isNull(posts.deletedAt)));
    const total = matching.length;

    // Flat chronological list; clients assemble reply trees via parentPostId.
    const data = await this.db
      .select({
        id: posts.id,
        topicId: posts.topicId,
        parentPostId: posts.parentPostId,
        authorCharacterId: posts.authorCharacterId,
        authorName: characters.publicName,
        body: posts.body,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .innerJoin(characters, eq(posts.authorCharacterId, characters.id))
      .where(and(eq(posts.topicId, id), eq(posts.isDeleted, false), isNull(posts.deletedAt)))
      .orderBy(asc(posts.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      topic: { ...topic, viewCount: nextViewCount },
      posts: { data, total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createTopic(dto: CreateTopicDto, userId: string): Promise<CreatedTopic> {
    // Main-first author: the main character posts when set, otherwise any active one.
    const [author] = await this.db
      .select({ id: characters.id })
      .from(characters)
      .where(
        and(
          eq(characters.userId, userId),
          eq(characters.status, 'active'),
          isNull(characters.deletedAt),
        ),
      )
      .orderBy(desc(characters.isMainCharacter), asc(characters.createdAt))
      .limit(1);

    if (!author) {
      throw new ForbiddenError('An active character is required to create topics');
    }

    // Throws 404 when missing, 403 when not visible (no masking on writes).
    await this.forumsService.assertForumAccess(dto.forumId, userId);

    const [forum] = await this.db
      .select({ isLocked: forums.isLocked })
      .from(forums)
      .where(eq(forums.id, dto.forumId))
      .limit(1);

    if (forum?.isLocked) {
      throw new ForbiddenError('This forum is locked and does not accept new topics');
    }

    const body = sanitizeHtml(dto.body);

    if (body.trim().length === 0) {
      throw new ValidationError('Topic body must not be empty');
    }

    const now = new Date();

    const [created] = await this.db
      .insert(topics)
      .values({
        forumId: dto.forumId,
        authorCharacterId: author.id,
        title: dto.title,
        body,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: topics.id,
        forumId: topics.forumId,
        authorCharacterId: topics.authorCharacterId,
        title: topics.title,
        body: topics.body,
        isPinned: topics.isPinned,
        isLocked: topics.isLocked,
        viewCount: topics.viewCount,
        replyCount: topics.replyCount,
        createdAt: topics.createdAt,
      });

    return created;
  }

  async updateTopic(
    id: string,
    userId: string,
    userRole: UserRole,
    dto: UpdateTopicDto,
  ): Promise<UpdatedTopic> {
    // Topics are authored by a character, so that character carries ownership:
    // the edit is allowed when it belongs to the caller and is still active.
    const [topic] = await this.db
      .select({
        id: topics.id,
        title: topics.title,
        body: topics.body,
        forumId: topics.forumId,
        authorCharacterId: topics.authorCharacterId,
        authorUserId: characters.userId,
        authorStatus: characters.status,
        authorDeletedAt: characters.deletedAt,
        isPinned: topics.isPinned,
        isLocked: topics.isLocked,
        viewCount: topics.viewCount,
        replyCount: topics.replyCount,
        createdAt: topics.createdAt,
      })
      .from(topics)
      .innerJoin(characters, eq(topics.authorCharacterId, characters.id))
      .where(and(eq(topics.id, id), eq(topics.isDeleted, false), isNull(topics.deletedAt)))
      .limit(1);

    if (!topic) {
      throw new NotFoundError('Topic', id);
    }

    const isStaff = userRole === 'admin' || userRole === 'webmaster';
    const isActiveAuthor =
      topic.authorUserId === userId &&
      topic.authorStatus === 'active' &&
      topic.authorDeletedAt === null;

    if (!isActiveAuthor && !isStaff) {
      throw new ForbiddenError('You do not own this topic');
    }

    // A lock freezes the topic for everyone but staff, who still moderate it.
    if (topic.isLocked && !isStaff) {
      throw new ForbiddenError('This topic is locked');
    }

    const current: UpdatedTopic = {
      id: topic.id,
      forumId: topic.forumId,
      authorCharacterId: topic.authorCharacterId,
      title: topic.title,
      body: topic.body,
      isPinned: topic.isPinned,
      isLocked: topic.isLocked,
      viewCount: topic.viewCount,
      replyCount: topic.replyCount,
      createdAt: topic.createdAt,
    };

    // PATCH with no fields is a no-op that reports the current state, matching
    // the convention already used by updateForum and updateProfile.
    if (dto.title === undefined && dto.body === undefined) {
      return current;
    }

    const body = dto.body !== undefined ? sanitizeHtml(dto.body) : undefined;

    if (body !== undefined && body.trim().length === 0) {
      throw new ValidationError('Topic body must not be empty');
    }

    const [updated] = await this.db
      .update(topics)
      .set({
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(body !== undefined ? { body } : {}),
        updatedAt: new Date(),
      })
      .where(eq(topics.id, id))
      .returning({
        id: topics.id,
        forumId: topics.forumId,
        authorCharacterId: topics.authorCharacterId,
        title: topics.title,
        body: topics.body,
        isPinned: topics.isPinned,
        isLocked: topics.isLocked,
        viewCount: topics.viewCount,
        replyCount: topics.replyCount,
        createdAt: topics.createdAt,
      });

    return updated;
  }

  async deleteTopic(id: string, userId: string, userRole: UserRole): Promise<void> {
    // Lookup without the deleted filters so we can distinguish "not found" from
    // "already deleted" (idempotent 204), mirroring deleteCharacter's shape.
    const [topic] = await this.db
      .select({
        id: topics.id,
        isLocked: topics.isLocked,
        authorUserId: characters.userId,
        authorStatus: characters.status,
        authorDeletedAt: characters.deletedAt,
        isDeleted: topics.isDeleted,
        deletedAt: topics.deletedAt,
      })
      .from(topics)
      .innerJoin(characters, eq(topics.authorCharacterId, characters.id))
      .where(eq(topics.id, id))
      .limit(1);

    if (!topic) {
      throw new NotFoundError('Topic', id);
    }

    // Already gone: idempotent 204, no write and no auth check.
    if (topic.isDeleted || topic.deletedAt !== null) {
      return;
    }

    const isStaff = userRole === 'admin' || userRole === 'webmaster';
    const isActiveAuthor =
      topic.authorUserId === userId &&
      topic.authorStatus === 'active' &&
      topic.authorDeletedAt === null;

    if (!isActiveAuthor && !isStaff) {
      throw new ForbiddenError('You do not own this topic');
    }

    // A lock freezes the topic for everyone but staff, who still moderate it.
    if (topic.isLocked && !isStaff) {
      throw new ForbiddenError('This topic is locked');
    }

    const now = new Date();

    await this.db
      .update(topics)
      .set({ isDeleted: true, deletedAt: now, updatedAt: now })
      .where(eq(topics.id, id));
  }
}
