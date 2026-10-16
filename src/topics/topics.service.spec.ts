import { ForbiddenError, NotFoundError } from '../common/exceptions/app-errors';
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
  return { dbMock: { select }, chains };
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
});
