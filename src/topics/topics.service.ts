import { Inject, Injectable } from '@nestjs/common';
import { SQL, and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { ForbiddenError, NotFoundError } from '../common/exceptions/app-errors';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { characters } from '../database/schema/characters';
import { forums } from '../database/schema/forums';
import { topics } from '../database/schema/topics';
import { ForumsService } from '../forums/forums.service';
import { ListTopicsQueryDto } from './dto/list-topics-query.dto';

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
}
