import { ForbiddenError, NotFoundError, ValidationError } from '../common/exceptions/app-errors';
import { PostsService } from './posts.service';

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

function createService(dbMock: unknown, forumsServiceMock?: unknown) {
  const forumsMock = forumsServiceMock ?? {
    assertForumAccess: jest.fn().mockResolvedValue('public'),
  };
  const service = new PostsService(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dbMock as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forumsMock as any,
  );
  return { service, forumsMock: forumsMock as { assertForumAccess: jest.Mock } };
}

describe('PostsService', () => {
  describe('createPost', () => {
    const dto = { topicId: 'topic-id-1', body: 'I pick Bulbasaur.' };

    const topicRow = {
      id: 'topic-id-1',
      forumId: 'forum-id-1',
      isLocked: false,
      replyCount: 5,
    };

    const createdRow = {
      id: 'post-id-1',
      topicId: 'topic-id-1',
      parentPostId: null,
      authorCharacterId: 'main-char-id',
      body: 'I pick Bulbasaur.',
      createdAt: new Date('2026-10-17T00:00:00.000Z'),
    };

    function createCreateDbMock(selectResults: unknown[], insertedRow: unknown = createdRow) {
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
      const updateWhere = jest.fn().mockResolvedValue([]);
      const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
      const update = jest.fn().mockReturnValue({ set: updateSet });
      return { dbMock: { select, insert, update }, chains, values, insert, updateSet, update };
    }

    it('should create a post authored by the main-first character', async () => {
      // Arrange
      const { dbMock, values } = createCreateDbMock([[{ id: 'main-char-id' }], [topicRow]]);
      const { service, forumsMock } = createService(dbMock);

      // Act
      const result = await service.createPost(dto, 'user-id-1');

      // Assert
      expect(forumsMock.assertForumAccess).toHaveBeenCalledWith('forum-id-1', 'user-id-1');
      expect(values).toHaveBeenCalledWith(
        expect.objectContaining({
          topicId: 'topic-id-1',
          parentPostId: null,
          authorCharacterId: 'main-char-id',
          body: 'I pick Bulbasaur.',
        }),
      );
      expect(result).toEqual(createdRow);
    });

    it('should increment the topic reply count', async () => {
      // Arrange
      const { dbMock, updateSet } = createCreateDbMock([[{ id: 'main-char-id' }], [topicRow]]);
      const { service } = createService(dbMock);

      // Act
      await service.createPost(dto, 'user-id-1');

      // Assert
      const patch = updateSet.mock.calls[0][0] as Record<string, unknown>;
      expect(patch.replyCount).toBe(6);
      expect(patch.updatedAt).toBeInstanceOf(Date);
    });

    it('should order the character lookup main-first', async () => {
      // Arrange
      const { dbMock, chains } = createCreateDbMock([[{ id: 'main-char-id' }], [topicRow]]);
      const { service } = createService(dbMock);

      // Act
      await service.createPost(dto, 'user-id-1');

      // Assert
      expect(chains[0].orderBy).toHaveBeenCalledTimes(1);
    });

    it('should throw ForbiddenError when the user has no active character', async () => {
      // Arrange
      const { dbMock, insert } = createCreateDbMock([[]]);
      const { service, forumsMock } = createService(dbMock);

      // Act
      const promise = service.createPost(dto, 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(forumsMock.assertForumAccess).not.toHaveBeenCalled();
      expect(insert).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when the topic does not exist', async () => {
      // Arrange
      const { dbMock, insert } = createCreateDbMock([[{ id: 'main-char-id' }], []]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.createPost(dto, 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(insert).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when the topic is locked', async () => {
      // Arrange
      const { dbMock, insert } = createCreateDbMock([
        [{ id: 'main-char-id' }],
        [{ ...topicRow, isLocked: true }],
      ]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.createPost(dto, 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(insert).not.toHaveBeenCalled();
    });

    it('should propagate not found when the forum does not exist', async () => {
      // Arrange
      const { dbMock, insert } = createCreateDbMock([[{ id: 'main-char-id' }], [topicRow]]);
      const { service } = createService(dbMock, {
        assertForumAccess: jest.fn().mockRejectedValue(new NotFoundError('Forum', 'forum-id-1')),
      });

      // Act
      const promise = service.createPost(dto, 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(insert).not.toHaveBeenCalled();
    });

    it('should propagate forbidden when the forum is not visible', async () => {
      // Arrange
      const { dbMock, insert } = createCreateDbMock([[{ id: 'main-char-id' }], [topicRow]]);
      const { service } = createService(dbMock, {
        assertForumAccess: jest
          .fn()
          .mockRejectedValue(new ForbiddenError('You do not have permission to view this forum')),
      });

      // Act
      const promise = service.createPost(dto, 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(insert).not.toHaveBeenCalled();
    });

    it('should store the sanitized body', async () => {
      // Arrange
      const { dbMock, values } = createCreateDbMock([[{ id: 'main-char-id' }], [topicRow]]);
      const { service } = createService(dbMock);

      // Act
      await service.createPost(
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
      const { dbMock, insert } = createCreateDbMock([[{ id: 'main-char-id' }], [topicRow]]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.createPost(
        { ...dto, body: '<script>alert("xss")</script>' },
        'user-id-1',
      );

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ValidationError);
      expect(insert).not.toHaveBeenCalled();
    });

    describe('with a parent post', () => {
      const reply = {
        topicId: 'topic-id-1',
        parentPostId: 'parent-post-id',
        body: 'Same here.',
      };

      it('should create a nested reply when the parent exists in the same topic', async () => {
        // Arrange
        const { dbMock, values } = createCreateDbMock([
          [{ id: 'main-char-id' }],
          [topicRow],
          [{ id: 'parent-post-id' }],
        ]);
        const { service } = createService(dbMock);

        // Act
        await service.createPost(reply, 'user-id-1');

        // Assert
        expect(values).toHaveBeenCalledWith(
          expect.objectContaining({ parentPostId: 'parent-post-id' }),
        );
      });

      it('should throw NotFoundError when the parent post does not exist', async () => {
        // Arrange
        const { dbMock, insert } = createCreateDbMock([[{ id: 'main-char-id' }], [topicRow], []]);
        const { service } = createService(dbMock);

        // Act
        const promise = service.createPost(reply, 'user-id-1');

        // Assert
        await expect(promise).rejects.toBeInstanceOf(NotFoundError);
        expect(insert).not.toHaveBeenCalled();
      });
    });
  });
});
