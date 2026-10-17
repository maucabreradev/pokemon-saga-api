import { ForbiddenError, NotFoundError, ValidationError } from '../common/exceptions/app-errors';
import { TopicsService } from './topics.service';

jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createChain(result: unknown): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {};
  chain.from = jest.fn().mockReturnValue(chain);
  chain.innerJoin = jest.fn().mockReturnValue(chain);
  chain.where = jest.fn().mockReturnValue(chain);
  chain.orderBy = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.offset = jest.fn().mockResolvedValue(result);
  chain.then = (resolve: (value: unknown) => void) => resolve(result);
  return chain;
}

function createDbMock(results: unknown[]) {
  const chains: Array<{
    where: jest.Mock;
    orderBy: jest.Mock;
    limit: jest.Mock;
    offset: jest.Mock;
    innerJoin: jest.Mock;
  }> = [];
  let calls = 0;
  const select = jest.fn().mockImplementation(() => {
    const chain = createChain(results[calls]);
    chains.push(chain);
    calls++;
    return chain;
  });
  const updateWhere = jest.fn().mockResolvedValue([]);
  const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
  const update = jest.fn().mockReturnValue({ set: updateSet });
  return { dbMock: { select, update }, chains, updateSet, updateWhere };
}

function createService(dbMock: unknown, forumsServiceMock?: unknown) {
  const forumsMock = forumsServiceMock ?? {
    assertForumAccess: jest.fn().mockResolvedValue('public'),
  };
  const service = new TopicsService(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dbMock as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forumsMock as any,
  );
  return { service, forumsMock: forumsMock as { assertForumAccess: jest.Mock } };
}

const topicRow = {
  id: 'topic-id-1',
  title: 'Best starter?',
  forumId: 'forum-id-1',
  forumName: 'General Discussion',
  authorCharacterId: 'char-id-1',
  authorName: 'Ash',
  replyCount: 5,
  viewCount: 10,
  isPinned: false,
  isLocked: false,
  createdAt: new Date('2026-10-15T00:00:00.000Z'),
};

describe('TopicsService', () => {
  describe('listTopics', () => {
    it('should return paginated topics with metadata', async () => {
      // Arrange
      const { dbMock } = createDbMock([[{ id: 'topic-id-1' }], [topicRow]]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.listTopics({ page: 1, limit: 20 });

      // Assert
      expect(result).toEqual({ data: [topicRow], total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it('should apply pagination as limit and offset', async () => {
      // Arrange
      const { dbMock, chains } = createDbMock([[], []]);
      const { service } = createService(dbMock);

      // Act
      await service.listTopics({ page: 2, limit: 10 });

      // Assert
      expect(chains[1].limit).toHaveBeenCalledWith(10);
      expect(chains[1].offset).toHaveBeenCalledWith(10);
    });

    it('should clamp the limit to a maximum of 50', async () => {
      // Arrange
      const { dbMock, chains } = createDbMock([[], []]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.listTopics({ page: 1, limit: 100 });

      // Assert
      expect(chains[1].limit).toHaveBeenCalledWith(50);
      expect(result.limit).toBe(50);
    });

    it('should join forums and characters for display names', async () => {
      // Arrange
      const { dbMock, chains } = createDbMock([[], []]);
      const { service } = createService(dbMock);

      // Act
      await service.listTopics({ page: 1, limit: 20 });

      // Assert
      expect(chains[1].innerJoin).toHaveBeenCalledTimes(2);
    });

    it('should return empty data with zero totals when nothing matches', async () => {
      // Arrange
      const { dbMock } = createDbMock([[], []]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.listTopics({ page: 1, limit: 20 });

      // Assert
      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    });

    it('should check forum access when filtering by forum', async () => {
      // Arrange
      const forumId = '11111111-1111-4111-8111-111111111111';
      const { dbMock } = createDbMock([[], []]);
      const { service, forumsMock } = createService(dbMock);

      // Act
      await service.listTopics({ page: 1, limit: 20, forumId });

      // Assert
      expect(forumsMock.assertForumAccess).toHaveBeenCalledWith(forumId, undefined);
    });

    it('should mask forbidden forums as not found for guests', async () => {
      // Arrange
      const forumId = '11111111-1111-4111-8111-111111111111';
      const { dbMock } = createDbMock([[], []]);
      const { service } = createService(dbMock, {
        assertForumAccess: jest
          .fn()
          .mockRejectedValue(new ForbiddenError('You do not have permission to view this forum')),
      });

      // Act
      const promise = service.listTopics({ page: 1, limit: 20, forumId });

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(dbMock.select).not.toHaveBeenCalled();
    });

    it('should propagate not found when the forum does not exist', async () => {
      // Arrange
      const forumId = '11111111-1111-4111-8111-111111111111';
      const { dbMock } = createDbMock([[], []]);
      const { service } = createService(dbMock, {
        assertForumAccess: jest.fn().mockRejectedValue(new NotFoundError('Forum', forumId)),
      });

      // Act
      const promise = service.listTopics({ page: 1, limit: 20, forumId });

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(dbMock.select).not.toHaveBeenCalled();
    });

    it('should order by reply count for the replies sort', async () => {
      // Arrange
      const { dbMock, chains } = createDbMock([[], []]);
      const { service } = createService(dbMock);

      // Act
      await service.listTopics({ page: 1, limit: 20, sort: 'replies' });

      // Assert
      expect(chains[1].orderBy).toHaveBeenCalledTimes(1);
    });

    it('should look up the viewer character when authenticated', async () => {
      // Arrange
      const { dbMock } = createDbMock([[{ id: 'char-id-1' }], [], []]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.listTopics({ page: 1, limit: 20 }, 'user-id-1');

      // Assert
      expect(dbMock.select).toHaveBeenCalledTimes(3);
      expect(result.total).toBe(0);
    });
  });

  describe('getTopicDetail', () => {
    const detailTopicRow = {
      id: 'topic-id-1',
      title: 'Best starter?',
      body: 'Which one do I pick?',
      forumId: 'forum-id-1',
      forumName: 'General Discussion',
      forumVisibility: 'public',
      authorCharacterId: 'char-id-1',
      authorName: 'Ash',
      isPinned: false,
      isLocked: false,
      viewCount: 5,
      createdAt: new Date('2026-10-15T00:00:00.000Z'),
    };

    const detailPostRow = (id: string, createdAt: string, parentPostId: string | null = null) => ({
      id,
      topicId: 'topic-id-1',
      parentPostId,
      authorCharacterId: 'char-id-1',
      authorName: 'Ash',
      body: `Body of ${id}`,
      createdAt: new Date(createdAt),
    });

    it('should return the topic with paginated posts in chronological order', async () => {
      // Arrange
      const rows = [
        detailPostRow('post-1', '2026-10-15T00:01:00.000Z'),
        detailPostRow('post-2', '2026-10-15T00:02:00.000Z'),
      ];
      const { dbMock, chains } = createDbMock([
        [detailTopicRow],
        [{ id: 'post-1' }, { id: 'post-2' }],
        rows,
      ]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.getTopicDetail('topic-id-1', { page: 1, limit: 20 });

      // Assert
      expect(result.topic.id).toBe('topic-id-1');
      expect(result.topic.viewCount).toBe(6);
      expect(result.posts).toEqual({ data: rows, total: 2, page: 1, limit: 20, totalPages: 1 });
      expect(chains[2].orderBy).toHaveBeenCalledTimes(1);
    });

    it('should apply pagination to posts as limit and offset', async () => {
      // Arrange
      const { dbMock, chains } = createDbMock([[detailTopicRow], [], []]);
      const { service } = createService(dbMock);

      // Act
      await service.getTopicDetail('topic-id-1', { page: 3, limit: 5 });

      // Assert
      expect(chains[2].limit).toHaveBeenCalledWith(5);
      expect(chains[2].offset).toHaveBeenCalledWith(10);
    });

    it('should throw NotFoundError when the topic does not exist', async () => {
      // Arrange
      const { dbMock } = createDbMock([[], [], []]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.getTopicDetail('missing-id', { page: 1, limit: 20 });

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(dbMock.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when the topic is deleted (same as missing)', async () => {
      // Arrange: deleted rows are filtered in the WHERE clause, so the db returns [].
      const { dbMock } = createDbMock([[], [], []]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.getTopicDetail('deleted-id', { page: 1, limit: 20 });

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(dbMock.update).not.toHaveBeenCalled();
    });

    it('should check forum access for the topic forum', async () => {
      // Arrange
      const { dbMock } = createDbMock([[detailTopicRow], [], []]);
      const { service, forumsMock } = createService(dbMock);

      // Act
      await service.getTopicDetail('topic-id-1', { page: 1, limit: 20 });

      // Assert
      expect(forumsMock.assertForumAccess).toHaveBeenCalledWith('forum-id-1', undefined);
    });

    it('should mask forbidden forums as not found for guests', async () => {
      // Arrange
      const { dbMock } = createDbMock([[detailTopicRow], [], []]);
      const { service } = createService(dbMock, {
        assertForumAccess: jest
          .fn()
          .mockRejectedValue(new ForbiddenError('You do not have permission to view this forum')),
      });

      // Act
      const promise = service.getTopicDetail('topic-id-1', { page: 1, limit: 20 });

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(dbMock.update).not.toHaveBeenCalled();
    });

    it('should propagate forbidden when an authenticated viewer lacks access', async () => {
      // Arrange
      const { dbMock } = createDbMock([[detailTopicRow], [], []]);
      const { service, forumsMock } = createService(dbMock, {
        assertForumAccess: jest
          .fn()
          .mockRejectedValue(new ForbiddenError('You do not have permission to view this forum')),
      });

      // Act
      const promise = service.getTopicDetail('topic-id-1', { page: 1, limit: 20 }, 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(forumsMock.assertForumAccess).toHaveBeenCalledWith('forum-id-1', 'user-id-1');
    });

    it('should increment the view count on each view', async () => {
      // Arrange
      const { dbMock, updateSet } = createDbMock([[detailTopicRow], [], []]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.getTopicDetail('topic-id-1', { page: 1, limit: 20 });

      // Assert
      expect(updateSet).toHaveBeenCalledWith({ viewCount: 6, updatedAt: expect.any(Date) });
      expect(result.topic.viewCount).toBe(6);
    });

    it('should return empty posts with zero totals when the topic has no posts', async () => {
      // Arrange
      const { dbMock } = createDbMock([[detailTopicRow], [], []]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.getTopicDetail('topic-id-1', { page: 1, limit: 20 });

      // Assert
      expect(result.posts).toEqual({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    });
  });

  describe('createTopic', () => {
    const dto = {
      forumId: 'forum-id-1',
      title: 'Best starter?',
      body: 'Which one do I pick?',
    };

    const createdRow = {
      id: 'topic-id-1',
      forumId: 'forum-id-1',
      authorCharacterId: 'main-char-id',
      title: 'Best starter?',
      body: 'Which one do I pick?',
      isPinned: false,
      isLocked: false,
      viewCount: 0,
      replyCount: 0,
      createdAt: new Date('2026-10-16T00:00:00.000Z'),
    };

    function createCreateDbMock(selectResults: unknown[], insertedRow: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chains: any[] = [];
      let selectCalls = 0;
      const select = jest.fn().mockImplementation(() => {
        const chain = createChain(selectResults[selectCalls]);
        chains.push(chain);
        selectCalls++;
        return chain;
      });
      const returning = jest.fn().mockResolvedValue([insertedRow]);
      const values = jest.fn().mockReturnValue({ returning });
      const insert = jest.fn().mockReturnValue({ values });
      return { dbMock: { select, update: jest.fn(), insert }, chains, values, insert };
    }

    it('should create a topic authored by the main-first character', async () => {
      // Arrange
      const { dbMock, values } = createCreateDbMock(
        [[{ id: 'main-char-id' }], [{ isLocked: false }]],
        createdRow,
      );
      const { service, forumsMock } = createService(dbMock);

      // Act
      const result = await service.createTopic(dto, 'user-id-1');

      // Assert
      expect(forumsMock.assertForumAccess).toHaveBeenCalledWith('forum-id-1', 'user-id-1');
      expect(values).toHaveBeenCalledWith(
        expect.objectContaining({
          forumId: 'forum-id-1',
          authorCharacterId: 'main-char-id',
          title: 'Best starter?',
          body: 'Which one do I pick?',
        }),
      );
      expect(result).toEqual(createdRow);
    });

    it('should order the character lookup main-first', async () => {
      // Arrange
      const { dbMock, chains } = createCreateDbMock(
        [[{ id: 'main-char-id' }], [{ isLocked: false }]],
        createdRow,
      );
      const { service } = createService(dbMock);

      // Act
      await service.createTopic(dto, 'user-id-1');

      // Assert
      expect(chains[0].orderBy).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenError when the user has no active character', async () => {
      // Arrange
      const { dbMock, insert } = createCreateDbMock([[], [{ isLocked: false }]], createdRow);
      const { service, forumsMock } = createService(dbMock);

      // Act
      const promise = service.createTopic(dto, 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(forumsMock.assertForumAccess).not.toHaveBeenCalled();
      expect(insert).not.toHaveBeenCalled();
    });

    it('should propagate not found when the forum does not exist', async () => {
      // Arrange
      const { dbMock, insert } = createCreateDbMock([[{ id: 'main-char-id' }]], createdRow);
      const { service } = createService(dbMock, {
        assertForumAccess: jest.fn().mockRejectedValue(new NotFoundError('Forum', 'forum-id-1')),
      });

      // Act
      const promise = service.createTopic(dto, 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(insert).not.toHaveBeenCalled();
    });

    it('should propagate forbidden when the forum is not visible', async () => {
      // Arrange
      const { dbMock, insert } = createCreateDbMock([[{ id: 'main-char-id' }]], createdRow);
      const { service } = createService(dbMock, {
        assertForumAccess: jest
          .fn()
          .mockRejectedValue(new ForbiddenError('You do not have permission to view this forum')),
      });

      // Act
      const promise = service.createTopic(dto, 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(insert).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when the forum is locked', async () => {
      // Arrange
      const { dbMock, insert } = createCreateDbMock(
        [[{ id: 'main-char-id' }], [{ isLocked: true }]],
        createdRow,
      );
      const { service } = createService(dbMock);

      // Act
      const promise = service.createTopic(dto, 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(insert).not.toHaveBeenCalled();
    });

    it('should store the sanitized body', async () => {
      // Arrange
      const { dbMock, values } = createCreateDbMock(
        [[{ id: 'main-char-id' }], [{ isLocked: false }]],
        createdRow,
      );
      const { service } = createService(dbMock);

      // Act
      await service.createTopic(
        { ...dto, body: '<script>alert("xss")</script><p>Hello</p>' },
        'user-id-1',
      );

      // Assert
      const stored = values.mock.calls[0][0] as { body: string };
      expect(stored.body).not.toContain('<script>');
      expect(stored.body).toContain('Hello');
    });

    it('should throw ValidationError when the body sanitizes to empty', async () => {
      // Arrange
      const { dbMock, insert } = createCreateDbMock(
        [[{ id: 'main-char-id' }], [{ isLocked: false }]],
        createdRow,
      );
      const { service } = createService(dbMock);

      // Act
      const promise = service.createTopic(
        { ...dto, body: '<script>alert("xss")</script>' },
        'user-id-1',
      );

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ValidationError);
      expect(insert).not.toHaveBeenCalled();
    });
  });

  describe('updateTopic', () => {
    const dto = { title: 'Updated title', body: 'Updated body' };

    const updatedRow = {
      id: 'topic-id-1',
      forumId: 'forum-id-1',
      authorCharacterId: 'char-id-1',
      title: 'Updated title',
      body: 'Updated body',
      isPinned: false,
      isLocked: false,
      viewCount: 10,
      replyCount: 5,
      createdAt: new Date('2026-10-15T00:00:00.000Z'),
    };

    // The lookup joins topics with the author character to resolve ownership.
    const lookupRow = (overrides: Record<string, unknown> = {}) => ({
      id: 'topic-id-1',
      title: 'Best starter?',
      body: 'Which one do I pick?',
      forumId: 'forum-id-1',
      authorCharacterId: 'char-id-1',
      authorUserId: 'user-id-1',
      authorStatus: 'active',
      authorDeletedAt: null as Date | null,
      isPinned: false,
      isLocked: false,
      viewCount: 10,
      replyCount: 5,
      createdAt: new Date('2026-10-15T00:00:00.000Z'),
      ...overrides,
    });

    const currentRow = {
      id: 'topic-id-1',
      title: 'Best starter?',
      body: 'Which one do I pick?',
      forumId: 'forum-id-1',
      authorCharacterId: 'char-id-1',
      isPinned: false,
      isLocked: false,
      viewCount: 10,
      replyCount: 5,
      createdAt: new Date('2026-10-15T00:00:00.000Z'),
    };

    function createUpdateDbMock(lookup: unknown[], updated: unknown = updatedRow) {
      const select = jest.fn().mockImplementation(() => createChain(lookup));
      const returning = jest.fn().mockResolvedValue([updated]);
      const updateWhere = jest.fn().mockReturnValue({ returning });
      const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
      const update = jest.fn().mockReturnValue({ set: updateSet });
      return { dbMock: { select, update }, updateSet, update };
    }

    function patchOf(updateSet: jest.Mock): Record<string, unknown> {
      return updateSet.mock.calls[0][0] as Record<string, unknown>;
    }

    it('should update the title and body for the author', async () => {
      // Arrange
      const { dbMock, updateSet } = createUpdateDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.updateTopic('topic-id-1', 'user-id-1', 'user', dto);

      // Assert
      expect(patchOf(updateSet)).toEqual(
        expect.objectContaining({ title: 'Updated title', body: 'Updated body' }),
      );
      expect(result).toEqual(updatedRow);
    });

    it('should set updatedAt explicitly, since PostgreSQL does not refresh it', async () => {
      // Arrange
      const { dbMock, updateSet } = createUpdateDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      await service.updateTopic('topic-id-1', 'user-id-1', 'user', dto);

      // Assert
      expect(patchOf(updateSet).updatedAt).toBeInstanceOf(Date);
    });

    it('should store the sanitized body', async () => {
      // Arrange
      const { dbMock, updateSet } = createUpdateDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      await service.updateTopic('topic-id-1', 'user-id-1', 'user', {
        body: '<script>alert("xss")</script><p>Hello</p>',
      });

      // Assert
      const stored = patchOf(updateSet).body as string;
      expect(stored).not.toContain('<script>');
      expect(stored).toContain('Hello');
    });

    it('should throw ValidationError when the sanitized body is empty', async () => {
      // Arrange
      const { dbMock, update } = createUpdateDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.updateTopic('topic-id-1', 'user-id-1', 'user', {
        body: '<script>alert("xss")</script>',
      });

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ValidationError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should update only the fields that were provided', async () => {
      // Arrange
      const { dbMock, updateSet } = createUpdateDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      await service.updateTopic('topic-id-1', 'user-id-1', 'user', { title: 'Renamed' });

      // Assert
      expect(patchOf(updateSet)).toHaveProperty('title', 'Renamed');
      expect(patchOf(updateSet)).not.toHaveProperty('body');
    });

    it('should return the current topic without writing when no fields are provided', async () => {
      // Arrange
      const { dbMock, update } = createUpdateDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.updateTopic('topic-id-1', 'user-id-1', 'user', {});

      // Assert
      expect(update).not.toHaveBeenCalled();
      expect(result).toEqual(currentRow);
    });

    it('should throw NotFoundError when the topic does not exist', async () => {
      // Arrange
      const { dbMock, update } = createUpdateDbMock([]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.updateTopic('topic-id-1', 'user-id-1', 'user', dto);

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when the caller is neither the author nor staff', async () => {
      // Arrange
      const { dbMock, update } = createUpdateDbMock([lookupRow({ authorUserId: 'someone-else' })]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.updateTopic('topic-id-1', 'user-id-1', 'user', dto);

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when the author character is not active', async () => {
      // Arrange
      const { dbMock, update } = createUpdateDbMock([lookupRow({ authorStatus: 'banned' })]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.updateTopic('topic-id-1', 'user-id-1', 'user', dto);

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should allow staff to edit a topic authored by someone else', async () => {
      // Arrange
      const { dbMock } = createUpdateDbMock([lookupRow({ authorUserId: 'someone-else' })]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.updateTopic('topic-id-1', 'staff-user-id', 'admin', dto);

      // Assert
      expect(result).toEqual(updatedRow);
    });

    it('should throw ForbiddenError when the topic is locked and the caller is the author', async () => {
      // Arrange
      const { dbMock, update } = createUpdateDbMock([lookupRow({ isLocked: true })]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.updateTopic('topic-id-1', 'user-id-1', 'user', dto);

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should allow staff to edit a locked topic', async () => {
      // Arrange
      const { dbMock } = createUpdateDbMock([lookupRow({ isLocked: true })]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.updateTopic('topic-id-1', 'staff-user-id', 'webmaster', dto);

      // Assert
      expect(result).toEqual(updatedRow);
    });
  });
});
