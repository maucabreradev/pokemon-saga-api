import { eq } from 'drizzle-orm';
import { NotFoundError } from '../common/exceptions/app-errors';
import { users } from '../database/schema/users';
import { UsersService } from './users.service';

jest.mock('drizzle-orm', () => {
  const actual = jest.requireActual('drizzle-orm');
  return { ...actual, eq: jest.fn() };
});

// database.module pulls @nestjs/config (ESM-only dist) which unit Jest (CJS)
// cannot parse. The DRIZZLE token carries no runtime behavior relevant here,
// so the module is stubbed and the db connection is injected as a manual mock.
jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

function createDbMock(rows: unknown[] = []) {
  const limitMock = jest.fn().mockResolvedValue(rows);
  return {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: limitMock,
        }),
      }),
    }),
  };
}

function createService(dbMock: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new UsersService(dbMock as any);
}

describe('UsersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const userRow = {
      id: userId,
      email: 'ash.ketchum@pallettown.gg',
      role: 'user' as const,
      createdAt: new Date('2026-10-15T00:00:00.000Z'),
    };

    it('should return the public profile for an existing user', async () => {
      const dbMock = createDbMock([userRow]);
      const service = createService(dbMock);

      const result = await service.getMe(userId);

      expect(result).toEqual(userRow);
      expect(result).not.toHaveProperty('passwordHash');
      expect(dbMock.select).toHaveBeenCalled();
    });

    it('should query by user id', async () => {
      const dbMock = createDbMock([userRow]);
      const service = createService(dbMock);
      const mockedEq = eq as jest.Mock;

      await service.getMe(userId);

      expect(mockedEq).toHaveBeenCalledWith(users.id, userId);
    });

    it('should throw NotFoundError when the user does not exist', async () => {
      const dbMock = createDbMock([]);
      const service = createService(dbMock);

      await expect(service.getMe(userId)).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
