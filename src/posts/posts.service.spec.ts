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

  describe('getPostDetail', () => {
    const postRow = {
      id: 'post-id-1',
      topicId: 'topic-id-1',
      parentPostId: null,
      authorCharacterId: 'char-id-1',
      authorName: 'Ash',
      body: 'I pick Bulbasaur.',
      forumId: 'forum-id-1',
      createdAt: new Date('2026-10-17T00:00:00.000Z'),
      updatedAt: new Date('2026-10-17T00:00:00.000Z'),
    };

    function createReadDbMock(selectResults: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chains: any[] = [];
      let selectCalls = 0;
      const select = jest.fn().mockImplementation(() => {
        const chain = createChain(selectResults[selectCalls]);
        chains.push(chain);
        selectCalls++;
        return chain;
      });
      return { dbMock: { select }, chains };
    }

    it('should return the post detail with its direct reply count', async () => {
      // Arrange
      const { dbMock } = createReadDbMock([[postRow], [{ id: 'reply-1' }, { id: 'reply-2' }]]);
      const { service, forumsMock } = createService(dbMock);

      // Act
      const result = await service.getPostDetail('post-id-1');

      // Assert
      expect(forumsMock.assertForumAccess).toHaveBeenCalledWith('forum-id-1', undefined);
      expect(result).toEqual({
        id: 'post-id-1',
        topicId: 'topic-id-1',
        parentPostId: null,
        authorCharacterId: 'char-id-1',
        authorName: 'Ash',
        body: 'I pick Bulbasaur.',
        replyCount: 2,
        createdAt: postRow.createdAt,
        updatedAt: postRow.updatedAt,
      });
      expect(result).not.toHaveProperty('forumId');
    });

    it('should query the reply count by parent post id', async () => {
      // Arrange
      const { dbMock, chains } = createReadDbMock([[postRow], []]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.getPostDetail('post-id-1');

      // Assert
      expect(chains[1].where).toHaveBeenCalledTimes(1);
      expect(result.replyCount).toBe(0);
    });

    it('should throw NotFoundError when the post does not exist', async () => {
      // Arrange
      const { dbMock } = createReadDbMock([[]]);
      const { service, forumsMock } = createService(dbMock);

      // Act
      const promise = service.getPostDetail('missing-id');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(forumsMock.assertForumAccess).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when the post is deleted (same as missing)', async () => {
      // Arrange: deleted rows are filtered in the WHERE clause, so the db returns [].
      const { dbMock } = createReadDbMock([[]]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.getPostDetail('deleted-id');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should mask forbidden forums as not found for guests', async () => {
      // Arrange
      const { dbMock } = createReadDbMock([[postRow], []]);
      const { service } = createService(dbMock, {
        assertForumAccess: jest
          .fn()
          .mockRejectedValue(new ForbiddenError('You do not have permission to view this forum')),
      });

      // Act
      const promise = service.getPostDetail('post-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should propagate forbidden when an authenticated viewer lacks access', async () => {
      // Arrange
      const { dbMock } = createReadDbMock([[postRow], []]);
      const { service, forumsMock } = createService(dbMock, {
        assertForumAccess: jest
          .fn()
          .mockRejectedValue(new ForbiddenError('You do not have permission to view this forum')),
      });

      // Act
      const promise = service.getPostDetail('post-id-1', 'user-id-1');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(forumsMock.assertForumAccess).toHaveBeenCalledWith('forum-id-1', 'user-id-1');
    });

    it('should expose getPost as an alias of getPostDetail', async () => {
      // Arrange
      const { dbMock } = createReadDbMock([[postRow], []]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.getPost('post-id-1');

      // Assert
      expect(result.id).toBe('post-id-1');
    });
  });

  describe('updatePost', () => {
    const dto = { body: 'Updated reply.' };

    const updatedRow = {
      id: 'post-id-1',
      topicId: 'topic-id-1',
      parentPostId: null,
      authorCharacterId: 'char-id-1',
      body: 'Updated reply.',
      createdAt: new Date('2026-10-17T00:00:00.000Z'),
      updatedAt: new Date('2026-10-17T00:00:00.000Z'),
    };

    // The lookup joins posts with the author character to resolve ownership.
    const lookupRow = (overrides: Record<string, unknown> = {}) => ({
      id: 'post-id-1',
      topicId: 'topic-id-1',
      parentPostId: null,
      authorCharacterId: 'char-id-1',
      body: 'I pick Bulbasaur.',
      authorUserId: 'user-id-1',
      authorStatus: 'active',
      authorDeletedAt: null as Date | null,
      createdAt: new Date('2026-10-17T00:00:00.000Z'),
      updatedAt: new Date('2026-10-17T00:00:00.000Z'),
      ...overrides,
    });

    const currentRow = {
      id: 'post-id-1',
      topicId: 'topic-id-1',
      parentPostId: null,
      authorCharacterId: 'char-id-1',
      body: 'I pick Bulbasaur.',
      createdAt: new Date('2026-10-17T00:00:00.000Z'),
      updatedAt: new Date('2026-10-17T00:00:00.000Z'),
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

    it('should update the body for the author', async () => {
      // Arrange
      const { dbMock, updateSet } = createUpdateDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.updatePost('post-id-1', 'user-id-1', 'user', dto);

      // Assert
      expect(patchOf(updateSet)).toEqual(expect.objectContaining({ body: 'Updated reply.' }));
      expect(result).toEqual(updatedRow);
    });

    it('should set updatedAt explicitly, since PostgreSQL does not refresh it', async () => {
      // Arrange
      const { dbMock, updateSet } = createUpdateDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      await service.updatePost('post-id-1', 'user-id-1', 'user', dto);

      // Assert
      expect(patchOf(updateSet).updatedAt).toBeInstanceOf(Date);
    });

    it('should store the sanitized body', async () => {
      // Arrange
      const { dbMock, updateSet } = createUpdateDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      await service.updatePost('post-id-1', 'user-id-1', 'user', {
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
      const promise = service.updatePost('post-id-1', 'user-id-1', 'user', {
        body: '<script>alert("xss")</script>',
      });

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ValidationError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should return the current post without writing when no fields are provided', async () => {
      // Arrange
      const { dbMock, update } = createUpdateDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.updatePost('post-id-1', 'user-id-1', 'user', {});

      // Assert
      expect(update).not.toHaveBeenCalled();
      expect(result).toEqual(currentRow);
    });

    it('should throw NotFoundError when the post does not exist', async () => {
      // Arrange
      const { dbMock, update } = createUpdateDbMock([]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.updatePost('post-id-1', 'user-id-1', 'user', dto);

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when the caller is neither the author nor staff', async () => {
      // Arrange
      const { dbMock, update } = createUpdateDbMock([lookupRow({ authorUserId: 'someone-else' })]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.updatePost('post-id-1', 'user-id-1', 'user', dto);

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when the author character is not active', async () => {
      // Arrange
      const { dbMock, update } = createUpdateDbMock([lookupRow({ authorStatus: 'banned' })]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.updatePost('post-id-1', 'user-id-1', 'user', dto);

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should allow staff to edit a post authored by someone else', async () => {
      // Arrange
      const { dbMock } = createUpdateDbMock([lookupRow({ authorUserId: 'someone-else' })]);
      const { service } = createService(dbMock);

      // Act
      const result = await service.updatePost('post-id-1', 'staff-user-id', 'admin', dto);

      // Assert
      expect(result).toEqual(updatedRow);
    });
  });

  describe('deletePost', () => {
    // The lookup joins posts with the author character for ownership and with
    // the topic for the denormalized reply count to decrement.
    const lookupRow = (overrides: Record<string, unknown> = {}) => ({
      id: 'post-id-1',
      topicId: 'topic-id-1',
      authorUserId: 'user-id-1',
      authorStatus: 'active',
      authorDeletedAt: null as Date | null,
      isDeleted: false,
      deletedAt: null as Date | null,
      topicReplyCount: 5,
      ...overrides,
    });

    function createDeleteDbMock(lookup: unknown[]) {
      const select = jest.fn().mockImplementation(() => createChain(lookup));
      const updateWhere = jest.fn().mockResolvedValue([]);
      const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
      const update = jest.fn().mockReturnValue({ set: updateSet });
      return { dbMock: { select, update }, updateSet, update };
    }

    it('should soft delete the post for the author', async () => {
      // Arrange
      const { dbMock, updateSet } = createDeleteDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      await service.deletePost('post-id-1', 'user-id-1', 'user');

      // Assert
      const patch = updateSet.mock.calls[0][0] as Record<string, unknown>;
      expect(patch.isDeleted).toBe(true);
      expect(patch.deletedAt).toBeInstanceOf(Date);
      expect(patch.updatedAt).toBeInstanceOf(Date);
    });

    it('should decrement the topic reply count', async () => {
      // Arrange
      const { dbMock, updateSet, update } = createDeleteDbMock([lookupRow()]);
      const { service } = createService(dbMock);

      // Act
      await service.deletePost('post-id-1', 'user-id-1', 'user');

      // Assert
      expect(update).toHaveBeenCalledTimes(2);
      const patch = updateSet.mock.calls[1][0] as Record<string, unknown>;
      expect(patch.replyCount).toBe(4);
      expect(patch.updatedAt).toBeInstanceOf(Date);
    });

    it('should not decrement the topic reply count below zero', async () => {
      // Arrange
      const { dbMock, updateSet } = createDeleteDbMock([lookupRow({ topicReplyCount: 0 })]);
      const { service } = createService(dbMock);

      // Act
      await service.deletePost('post-id-1', 'user-id-1', 'user');

      // Assert
      const patch = updateSet.mock.calls[1][0] as Record<string, unknown>;
      expect(patch.replyCount).toBe(0);
    });

    it('should throw NotFoundError when the post does not exist', async () => {
      // Arrange
      const { dbMock, update } = createDeleteDbMock([]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.deletePost('post-id-1', 'user-id-1', 'user');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(NotFoundError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should be idempotent (no write) when the post is already deleted', async () => {
      // Arrange
      const { dbMock, update } = createDeleteDbMock([
        lookupRow({ isDeleted: true, deletedAt: new Date() }),
      ]);
      const { service } = createService(dbMock);

      // Act
      await service.deletePost('post-id-1', 'user-id-1', 'user');

      // Assert
      expect(update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when the caller is neither the author nor staff', async () => {
      // Arrange
      const { dbMock, update } = createDeleteDbMock([lookupRow({ authorUserId: 'someone-else' })]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.deletePost('post-id-1', 'user-id-1', 'user');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when the author character is not active', async () => {
      // Arrange
      const { dbMock, update } = createDeleteDbMock([lookupRow({ authorStatus: 'banned' })]);
      const { service } = createService(dbMock);

      // Act
      const promise = service.deletePost('post-id-1', 'user-id-1', 'user');

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
      expect(update).not.toHaveBeenCalled();
    });

    it('should allow staff to delete a post authored by someone else', async () => {
      // Arrange
      const { dbMock, update } = createDeleteDbMock([lookupRow({ authorUserId: 'someone-else' })]);
      const { service } = createService(dbMock);

      // Act
      await service.deletePost('post-id-1', 'staff-user-id', 'admin');

      // Assert
      expect(update).toHaveBeenCalledTimes(2);
    });
  });
});
