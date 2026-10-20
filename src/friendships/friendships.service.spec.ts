import { ForbiddenError } from '../common/exceptions/app-errors';
import { FriendshipsService } from './friendships.service';

jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createChain(result: unknown): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {};
  chain.from = jest.fn().mockReturnValue(chain);
  chain.innerJoin = jest.fn().mockReturnValue(chain);
  chain.leftJoin = jest.fn().mockReturnValue(chain);
  chain.where = jest.fn().mockReturnValue(chain);
  chain.orderBy = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.offset = jest.fn().mockResolvedValue(result);
  chain.then = (resolve: (value: unknown) => void) => resolve(result);
  return chain;
}

// Drizzle binds values as Param chunks inside the SQL tree, so the bound
// parameters are what a test can read to know how the row was filtered.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectWhereParams(node: any): unknown[] {
  const values: unknown[] = [];
  const visit = (candidate: unknown): void => {
    if (!candidate || typeof candidate !== 'object') {
      return;
    }
    if (Array.isArray(candidate)) {
      candidate.forEach(visit);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = candidate as any;
    if (Array.isArray(record.queryChunks)) {
      record.queryChunks.forEach(visit);
      return;
    }
    if ('value' in record && 'encoder' in record) {
      values.push(record.value);
    }
  };
  visit(node);
  return values;
}

describe('FriendshipsService', () => {
  const characterRow = { id: 'main-char-id' };

  const friendRow = (
    readableId: string,
    publicName: string,
    friendshipCreatedAt: string,
    avatarUrl: string | null = null,
  ) => ({
    readableId,
    publicName,
    avatarUrl,
    friendshipCreatedAt: new Date(friendshipCreatedAt),
  });

  function createDbMock(selectResults: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chains: any[] = [];
    let selectCalls = 0;
    const select = jest.fn().mockImplementation(() => {
      const chain = createChain(selectResults[selectCalls] ?? []);
      chains.push(chain);
      selectCalls++;
      return chain;
    });
    return { dbMock: { select }, chains, select };
  }

  function createService(dbMock: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new FriendshipsService(dbMock as any);
  }

  function whereParamsOf(chain: unknown): unknown[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where = (chain as any).where as jest.Mock;
    return collectWhereParams(where.mock.calls[0][0]);
  }

  describe('listFriendships', () => {
    it('should throw ForbiddenError when the user has no active character', async () => {
      // Arrange: a banned or deleted character is filtered in the WHERE clause, so the db returns [].
      const { dbMock } = createDbMock([[]]);
      const service = createService(dbMock);

      // Act
      const promise = service.listFriendships('user-id-1', { page: 1, limit: 20 });

      // Assert
      await expect(promise).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('should list only accepted friendships by default', async () => {
      // Arrange
      const { dbMock, chains } = createDbMock([[characterRow], [], []]);
      const service = createService(dbMock);

      // Act
      await service.listFriendships('user-id-1', { page: 1, limit: 20 });

      // Assert
      expect(whereParamsOf(chains[1])).toContain('accepted');
      expect(whereParamsOf(chains[2])).toContain('accepted');
    });

    it('should filter by the requested status', async () => {
      // Arrange
      const { dbMock, chains } = createDbMock([[characterRow], [], []]);
      const service = createService(dbMock);

      // Act
      await service.listFriendships('user-id-1', { page: 1, limit: 20, status: 'pending' });

      // Assert
      expect(whereParamsOf(chains[1])).toContain('pending');
      expect(whereParamsOf(chains[2])).toContain('pending');
    });

    it('should only list the characters the caller blocked when filtering by blocked', async () => {
      // Arrange
      const { dbMock, chains, select } = createDbMock([[characterRow], []]);
      const service = createService(dbMock);

      // Act
      await service.listFriendships('user-id-1', { page: 1, limit: 20, status: 'blocked' });

      // Assert: the addressee direction is skipped, so nobody who blocked the caller leaks.
      expect(select).toHaveBeenCalledTimes(2);
      expect(chains[2]).toBeUndefined();
      expect(whereParamsOf(chains[1])).toContain('blocked');
    });

    it('should merge friends from both directions newest first', async () => {
      // Arrange
      const requesterRows = [friendRow('OldFriend111', 'Bulbasaur', '2026-10-10T00:00:00.000Z')];
      const addresseeRows = [friendRow('NewFriend222', 'Charmander', '2026-10-15T00:00:00.000Z')];
      const { dbMock } = createDbMock([[characterRow], requesterRows, addresseeRows]);
      const service = createService(dbMock);

      // Act
      const result = await service.listFriendships('user-id-1', { page: 1, limit: 20 });

      // Assert
      expect(result).toEqual([
        {
          readableId: 'NewFriend222',
          publicName: 'Charmander',
          avatarUrl: null,
          friendshipCreatedAt: new Date('2026-10-15T00:00:00.000Z'),
        },
        {
          readableId: 'OldFriend111',
          publicName: 'Bulbasaur',
          avatarUrl: null,
          friendshipCreatedAt: new Date('2026-10-10T00:00:00.000Z'),
        },
      ]);
    });

    it('should return the avatar of the friend profile when it exists', async () => {
      // Arrange
      const rows = [
        friendRow(
          'Friend111',
          'Bulbasaur',
          '2026-10-15T00:00:00.000Z',
          'https://example.com/a.png',
        ),
      ];
      const { dbMock } = createDbMock([[characterRow], rows, []]);
      const service = createService(dbMock);

      // Act
      const result = await service.listFriendships('user-id-1', { page: 1, limit: 20 });

      // Assert
      expect(result[0].avatarUrl).toBe('https://example.com/a.png');
    });

    it('should apply pagination after merging', async () => {
      // Arrange
      const requesterRows = [
        friendRow('Friend111', 'Bulbasaur', '2026-10-10T00:00:00.000Z'),
        friendRow('Friend222', 'Ivysaur', '2026-10-11T00:00:00.000Z'),
      ];
      const addresseeRows = [friendRow('Friend333', 'Venusaur', '2026-10-12T00:00:00.000Z')];
      const { dbMock } = createDbMock([[characterRow], requesterRows, addresseeRows]);
      const service = createService(dbMock);

      // Act
      const result = await service.listFriendships('user-id-1', { page: 2, limit: 2 });

      // Assert
      expect(result).toEqual([
        {
          readableId: 'Friend111',
          publicName: 'Bulbasaur',
          avatarUrl: null,
          friendshipCreatedAt: new Date('2026-10-10T00:00:00.000Z'),
        },
      ]);
    });

    it('should return an empty array when the character has no friendships', async () => {
      // Arrange
      const { dbMock } = createDbMock([[characterRow], [], []]);
      const service = createService(dbMock);

      // Act
      const result = await service.listFriendships('user-id-1', { page: 1, limit: 20 });

      // Assert
      expect(result).toEqual([]);
    });

    it('should exclude deleted or banned friends', async () => {
      // Arrange: non-active friends are filtered in the WHERE clause, so the db never returns them.
      const { dbMock, chains } = createDbMock([[characterRow], [], []]);
      const service = createService(dbMock);

      // Act
      const result = await service.listFriendships('user-id-1', { page: 1, limit: 20 });

      // Assert
      expect(result).toEqual([]);
      expect(whereParamsOf(chains[1])).toContain('active');
      expect(whereParamsOf(chains[2])).toContain('active');
    });
  });
});
