import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../common/exceptions/app-errors';
import { characters } from '../database/schema/characters';
import { refreshTokens } from '../database/schema/refresh-tokens';
import { users } from '../database/schema/users';
import { UsersService } from './users.service';

jest.mock('drizzle-orm', () => {
  const actual = jest.requireActual('drizzle-orm');
  return {
    ...actual,
    eq: jest.fn(),
    and: jest.fn(),
    asc: jest.fn(),
    isNull: jest.fn(),
    ne: jest.fn(),
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

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

const mockedHash = bcrypt.hash as jest.Mock;
const mockedCompare = bcrypt.compare as jest.Mock;

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

  describe('updateEmail', () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const currentRow = {
      id: userId,
      email: 'ash.ketchum@pallettown.gg',
      role: 'user' as const,
      createdAt: new Date('2026-10-15T00:00:00.000Z'),
    };
    const newEmail = 'ash.ketchum@indigo.gg';
    const updatedRow = { ...currentRow, email: newEmail };

    function createUpdateDbMock(first: unknown[], second: unknown[] = [], updated: unknown = {}) {
      const limitMock = jest.fn().mockResolvedValueOnce(first).mockResolvedValue(second);
      const returningMock = jest.fn().mockResolvedValue([updated]);
      const whereMock = jest.fn().mockReturnValue({ returning: returningMock });
      const setMock = jest.fn().mockReturnValue({ where: whereMock });
      const dbMock = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({ limit: limitMock }),
          }),
        }),
        update: jest.fn().mockReturnValue({ set: setMock }),
      };
      return { dbMock, setMock };
    }

    it('should update the email, refresh updatedAt, and return the public profile', async () => {
      const { dbMock, setMock } = createUpdateDbMock([currentRow], [], updatedRow);
      const service = createService(dbMock);

      const result = await service.updateEmail(userId, newEmail);

      expect(result).toEqual(updatedRow);
      expect(result).not.toHaveProperty('passwordHash');
      expect(dbMock.update).toHaveBeenCalled();
      const setValues = setMock.mock.calls[0][0];
      expect(setValues.email).toBe(newEmail);
      expect(setValues.updatedAt).toBeInstanceOf(Date);
    });

    it('should check uniqueness against the new email', async () => {
      const { dbMock } = createUpdateDbMock([currentRow], [], updatedRow);
      const service = createService(dbMock);
      const mockedEq = eq as jest.Mock;

      await service.updateEmail(userId, newEmail);

      expect(mockedEq).toHaveBeenCalledWith(users.email, newEmail);
    });

    it('should return the current profile without updating when the email is unchanged', async () => {
      const { dbMock } = createUpdateDbMock([currentRow]);
      const service = createService(dbMock);

      const result = await service.updateEmail(userId, currentRow.email);

      expect(result).toEqual(currentRow);
      expect(dbMock.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when the email is taken by another user', async () => {
      const { dbMock } = createUpdateDbMock([currentRow], [{ id: 'other-user-id' }]);
      const service = createService(dbMock);

      await expect(service.updateEmail(userId, newEmail)).rejects.toBeInstanceOf(ConflictError);
      expect(dbMock.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when the user does not exist', async () => {
      const { dbMock } = createUpdateDbMock([]);
      const service = createService(dbMock);

      await expect(service.updateEmail(userId, newEmail)).rejects.toBeInstanceOf(NotFoundError);
      expect(dbMock.update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const userRow = { id: userId, passwordHash: 'stored-hash' };

    function createPasswordDbMock(userRows: unknown[] = []) {
      const limitMock = jest.fn().mockResolvedValue(userRows);
      const userReturningMock = jest.fn().mockResolvedValue([{}]);
      const userWhereMock = jest.fn().mockReturnValue({ returning: userReturningMock });
      const userSetMock = jest.fn().mockReturnValue({ where: userWhereMock });
      const tokenWhereMock = jest.fn().mockResolvedValue([]);
      const tokenSetMock = jest.fn().mockReturnValue({ where: tokenWhereMock });
      const dbMock = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({ limit: limitMock }),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        update: jest.fn((table: any) =>
          table === users ? { set: userSetMock } : { set: tokenSetMock },
        ),
      };
      return { dbMock, userSetMock, tokenSetMock };
    }

    it('should hash the new password, update the user, and revoke all sessions', async () => {
      const { dbMock, userSetMock, tokenSetMock } = createPasswordDbMock([userRow]);
      const service = createService(dbMock);
      mockedCompare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      mockedHash.mockResolvedValue('new-hashed-password');

      await service.changePassword(userId, 'pikachu-25-forever', 'charizard-06-forever');

      expect(mockedCompare).toHaveBeenCalledWith('pikachu-25-forever', 'stored-hash');
      expect(mockedHash).toHaveBeenCalledWith('charizard-06-forever', 12);
      expect(dbMock.update).toHaveBeenCalledWith(users);
      expect(dbMock.update).toHaveBeenCalledWith(refreshTokens);
      const userSetValues = userSetMock.mock.calls[0][0];
      expect(userSetValues.passwordHash).toBe('new-hashed-password');
      expect(userSetValues.updatedAt).toBeInstanceOf(Date);
      const tokenSetValues = tokenSetMock.mock.calls[0][0];
      expect(tokenSetValues.revokedAt).toBeInstanceOf(Date);
    });

    it('should throw UnauthorizedError when the current password is wrong', async () => {
      const { dbMock } = createPasswordDbMock([userRow]);
      const service = createService(dbMock);
      mockedCompare.mockResolvedValue(false);

      await expect(
        service.changePassword(userId, 'wrong-password', 'charizard-06-forever'),
      ).rejects.toBeInstanceOf(UnauthorizedError);
      expect(mockedHash).not.toHaveBeenCalled();
      expect(dbMock.update).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when the new password equals the current one', async () => {
      const { dbMock } = createPasswordDbMock([userRow]);
      const service = createService(dbMock);
      mockedCompare.mockResolvedValue(true);

      await expect(
        service.changePassword(userId, 'pikachu-25-forever', 'pikachu-25-forever'),
      ).rejects.toBeInstanceOf(ValidationError);
      expect(mockedHash).not.toHaveBeenCalled();
      expect(dbMock.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when the user does not exist', async () => {
      const { dbMock } = createPasswordDbMock([]);
      const service = createService(dbMock);

      await expect(
        service.changePassword(userId, 'pikachu-25-forever', 'charizard-06-forever'),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(mockedCompare).not.toHaveBeenCalled();
      expect(mockedHash).not.toHaveBeenCalled();
      expect(dbMock.update).not.toHaveBeenCalled();
    });
  });

  describe('getMyCharacters', () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const rows = [
      {
        id: '22222222-2222-4222-8222-222222222222',
        readableId: 'GreenAppleHunter123',
        publicName: 'Pikachu',
        status: 'active' as const,
        isMainCharacter: true,
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        readableId: 'BlueOceanRunner456',
        publicName: 'Charizard',
        status: 'banned' as const,
        isMainCharacter: false,
      },
    ];

    function createListDbMock(listRows: unknown[] = []) {
      const orderByMock = jest.fn().mockResolvedValue(listRows);
      const dbMock = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({ orderBy: orderByMock }),
          }),
        }),
      };
      return { dbMock, orderByMock };
    }

    it('should return all character summaries of the user', async () => {
      const { dbMock } = createListDbMock(rows);
      const service = createService(dbMock);

      const result = await service.getMyCharacters(userId);

      expect(result).toEqual(rows);
      expect(result).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ userId: expect.anything() })]),
      );
    });

    it('should filter by user and exclude deleted characters', async () => {
      const { dbMock } = createListDbMock(rows);
      const service = createService(dbMock);

      await service.getMyCharacters(userId);

      expect(eq).toHaveBeenCalledWith(characters.userId, userId);
      expect(ne).toHaveBeenCalledWith(characters.status, 'deleted');
      expect(isNull).toHaveBeenCalledWith(characters.deletedAt);
      expect(and).toHaveBeenCalled();
      expect(asc).toHaveBeenCalledWith(characters.createdAt);
    });

    it('should return an empty array when the user has no characters', async () => {
      const { dbMock } = createListDbMock([]);
      const service = createService(dbMock);

      await expect(service.getMyCharacters(userId)).resolves.toEqual([]);
    });
  });
});
