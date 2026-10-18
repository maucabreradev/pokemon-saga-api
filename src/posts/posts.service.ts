import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { ForbiddenError, NotFoundError, ValidationError } from '../common/exceptions/app-errors';
import { sanitizeHtml } from '../common/utils/sanitize-html';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { characters } from '../database/schema/characters';
import { posts } from '../database/schema/posts';
import { topics } from '../database/schema/topics';
import { ForumsService } from '../forums/forums.service';
import { CreatePostDto } from './dto/create-post.dto';

export interface CreatedPost {
  id: string;
  topicId: string;
  parentPostId: string | null;
  authorCharacterId: string;
  body: string;
  createdAt: Date;
}

export interface PostDetail {
  id: string;
  topicId: string;
  parentPostId: string | null;
  authorCharacterId: string;
  authorName: string;
  body: string;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PostsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly forumsService: ForumsService,
  ) {}

  async createPost(dto: CreatePostDto, userId: string): Promise<CreatedPost> {
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
      throw new ForbiddenError('An active character is required to create posts');
    }

    const [topic] = await this.db
      .select({
        id: topics.id,
        forumId: topics.forumId,
        isLocked: topics.isLocked,
        replyCount: topics.replyCount,
      })
      .from(topics)
      .where(and(eq(topics.id, dto.topicId), eq(topics.isDeleted, false), isNull(topics.deletedAt)))
      .limit(1);

    if (!topic) {
      throw new NotFoundError('Topic', dto.topicId);
    }

    // Throws 404 when missing, 403 when not visible (no masking on writes).
    await this.forumsService.assertForumAccess(topic.forumId, userId);

    if (topic.isLocked) {
      throw new ForbiddenError('This topic is locked and does not accept new posts');
    }

    // A reply may only attach to an existing, non-deleted post in the same topic.
    if (dto.parentPostId !== undefined) {
      const [parent] = await this.db
        .select({ id: posts.id })
        .from(posts)
        .where(
          and(
            eq(posts.id, dto.parentPostId),
            eq(posts.topicId, dto.topicId),
            eq(posts.isDeleted, false),
            isNull(posts.deletedAt),
          ),
        )
        .limit(1);

      if (!parent) {
        throw new NotFoundError('Post', dto.parentPostId);
      }
    }

    const body = sanitizeHtml(dto.body);

    if (body.trim().length === 0) {
      throw new ValidationError('Post body must not be empty');
    }

    const now = new Date();

    const [created] = await this.db
      .insert(posts)
      .values({
        topicId: dto.topicId,
        parentPostId: dto.parentPostId ?? null,
        authorCharacterId: author.id,
        body,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: posts.id,
        topicId: posts.topicId,
        parentPostId: posts.parentPostId,
        authorCharacterId: posts.authorCharacterId,
        body: posts.body,
        createdAt: posts.createdAt,
      });

    await this.db
      .update(topics)
      .set({ replyCount: topic.replyCount + 1, updatedAt: now })
      .where(eq(topics.id, dto.topicId));

    return created;
  }

  async getPostDetail(id: string, userId?: string): Promise<PostDetail> {
    const [post] = await this.db
      .select({
        id: posts.id,
        topicId: posts.topicId,
        parentPostId: posts.parentPostId,
        authorCharacterId: posts.authorCharacterId,
        authorName: characters.publicName,
        body: posts.body,
        forumId: topics.forumId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .innerJoin(characters, eq(posts.authorCharacterId, characters.id))
      .innerJoin(topics, eq(posts.topicId, topics.id))
      .where(
        and(
          eq(posts.id, id),
          eq(posts.isDeleted, false),
          isNull(posts.deletedAt),
          // A post whose topic was deleted is no longer reachable.
          eq(topics.isDeleted, false),
          isNull(topics.deletedAt),
        ),
      )
      .limit(1);

    if (!post) {
      throw new NotFoundError('Post', id);
    }

    try {
      await this.forumsService.assertForumAccess(post.forumId, userId);
    } catch (error) {
      // Guests must not learn posts in non-public forums exist (same mask as getTopicDetail).
      if (userId === undefined && error instanceof ForbiddenError) {
        throw new NotFoundError('Post', id);
      }
      throw error;
    }

    const replies = await this.db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.parentPostId, id), eq(posts.isDeleted, false), isNull(posts.deletedAt)));

    return {
      id: post.id,
      topicId: post.topicId,
      parentPostId: post.parentPostId,
      authorCharacterId: post.authorCharacterId,
      authorName: post.authorName,
      body: post.body,
      replyCount: replies.length,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  // Alias kept for callers that prefer the shorter name; both return the same detail.
  getPost(id: string, userId?: string): Promise<PostDetail> {
    return this.getPostDetail(id, userId);
  }
}
