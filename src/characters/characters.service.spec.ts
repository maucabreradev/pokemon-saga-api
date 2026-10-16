import { ConflictError, ForbiddenError, NotFoundError } from '../common/exceptions/app-errors';
import { characters } from '../database/schema/characters';
import { charactersProfile } from '../database/schema/characters-profile';
import { CharactersService } from './characters.service';

jest.mock('drizzle-orm', () => {
  const actual = jest.requireActual('drizzle-orm');
  return { ...actual };
});

jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

jest.mock('../common/utils/readable-id-generator', () => ({
  generateUniqueReadableId: jest.fn(),
}));

function createDbMock(userRows: unknown[] = [], countRows: unknown[] = []) {
  let selectCalls = 0;

  const selectMock = jest.fn().mockImplementation(() => {
    selectCalls++;

    if (selectCalls === 1) {
      // User lookup: select().from().where().limit(1)
      return {
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(userRows),
          }),
        }),
      };
    }

    // Character count: select().from().where() awaited directly (no .limit())
    return {
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          then: (resolve: (value: unknown) => void) => {
            resolve(countRows);
          },
        }),
      }),
    };
  });

  const charInsert = {
    // Echo the service inputs so tests assert real service behavior, not mock data.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: jest.fn((input: any) => ({
      returning: jest.fn().mockResolvedValue([
        {
          id: 'new-char-id',
          readableId: input.readableId,
          publicName: input.publicName,
          status: input.status,
          isMainCharacter: input.isMainCharacter,
          createdAt: input.createdAt,
        },
      ]),
    })),
  };
  const profileInsert = {
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([{ characterId: 'new-char-id' }]),
    }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txInsert = jest.fn((table: any) => {
    if (table === characters) return charInsert;
    if (table === charactersProfile) return profileInsert;
    return charInsert;
  });

  const transactionMock = jest.fn((cb: (tx: unknown) => unknown) => cb({ insert: txInsert }));

  return {
    dbMock: {
      select: selectMock,
      transaction: transactionMock,
    },
    transactionMock,
    txInsert,
  };
}

function createService(dbMock: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new CharactersService(dbMock as any);
}

describe('CharactersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const userRow = { id: userId, deletedAt: null };
    const dto = { publicName: 'Pikachu', bio: 'Electric mouse' };

    it('should create the character and its profile in one transaction, first is main', async () => {
      const { dbMock, transactionMock, txInsert } = createDbMock([userRow], []);
      const service = createService(dbMock);

      const { generateUniqueReadableId } = jest.requireMock(
        '../common/utils/readable-id-generator',
      );
      generateUniqueReadableId.mockResolvedValue('GreenAppleHunter123');

      const result = await service.create(userId, dto);

      expect(result).toEqual({
        id: 'new-char-id',
        readableId: 'GreenAppleHunter123',
        publicName: dto.publicName,
        status: 'active',
        isMainCharacter: true,
        bio: dto.bio,
        createdAt: expect.any(Date),
      });
      expect(transactionMock).toHaveBeenCalledTimes(1);
      expect(txInsert).toHaveBeenCalledTimes(2);
    });

    it('should set isMainCharacter=false when the user already has characters', async () => {
      const { dbMock } = createDbMock([userRow], [{ id: 'char1' }]);
      const service = createService(dbMock);

      const { generateUniqueReadableId } = jest.requireMock(
        '../common/utils/readable-id-generator',
      );
      generateUniqueReadableId.mockResolvedValue('BlueOceanRunner456');

      const result = await service.create(userId, dto);

      expect(result.isMainCharacter).toBe(false);
    });

    it('should throw NotFoundError when the user does not exist', async () => {
      const { dbMock } = createDbMock([]);
      const service = createService(dbMock);

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw ForbiddenError when the user already has 3 active characters', async () => {
      const threeChars = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const { dbMock } = createDbMock([userRow], threeChars);
      const service = createService(dbMock);

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('should use the readableId from the generator', async () => {
      const { dbMock } = createDbMock([userRow], []);
      const service = createService(dbMock);

      const { generateUniqueReadableId } = jest.requireMock(
        '../common/utils/readable-id-generator',
      );
      generateUniqueReadableId.mockResolvedValue('FinalUniqueId789');

      const result = await service.create(userId, dto);

      expect(result.readableId).toBe('FinalUniqueId789');
      expect(generateUniqueReadableId).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPublicProfile', () => {
    const readableId = 'GreenAppleHunter123';
    const publicRow = {
      readableId,
      publicName: 'Pikachu',
      bio: 'Electric mouse Pokemon',
      avatarUrl: 'https://example.com/avatar.png',
      customTitle: 'Champion',
      signature: 'Gotta catch em all',
      createdAt: new Date('2026-10-15T00:00:00.000Z'),
    };

    function createPublicProfileDbMock(rows: unknown[]) {
      const limit = jest.fn().mockResolvedValue(rows);
      const where = jest.fn().mockReturnValue({ limit });
      const leftJoin = jest.fn().mockReturnValue({ where });
      const from = jest.fn().mockReturnValue({ leftJoin });
      const select = jest.fn().mockReturnValue({ from });
      return { dbMock: { select }, select, from, leftJoin, where, limit };
    }

    it('should return the public profile without sensitive fields', async () => {
      const { dbMock } = createPublicProfileDbMock([publicRow]);
      const service = createService(dbMock);

      const result = await service.getPublicProfile(readableId);

      expect(result).toEqual(publicRow);
      expect(result).not.toHaveProperty('userId');
      expect(result).not.toHaveProperty('id');
    });

    it('should throw NotFoundError when the character does not exist', async () => {
      const { dbMock } = createPublicProfileDbMock([]);
      const service = createService(dbMock);

      await expect(service.getPublicProfile('NopeNopeNope000')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it('should throw NotFoundError when the character is banned or deleted (same as missing)', async () => {
      // Banned/deleted rows are filtered in the WHERE clause, so the db returns [].
      const { dbMock, where } = createPublicProfileDbMock([]);
      const service = createService(dbMock);

      await expect(service.getPublicProfile(readableId)).rejects.toBeInstanceOf(NotFoundError);
      expect(where).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateProfile', () => {
    const readableId = 'GreenAppleHunter123';
    const ownerId = '11111111-1111-4111-8111-111111111111';
    const otherUserId = '99999999-9999-4999-8999-999999999999';
    const characterRow = {
      id: 'char-id',
      userId: ownerId,
      readableId,
      publicName: 'Pikachu',
      status: 'active',
      createdAt: new Date('2026-10-15T00:00:00.000Z'),
    };
    const publicRow = {
      readableId,
      publicName: 'Raichu',
      bio: 'Evolved electric mouse',
      avatarUrl: 'https://example.com/avatar.png',
      customTitle: 'Champion',
      signature: 'Gotta catch em all',
      createdAt: characterRow.createdAt,
    };

    function createUpdateDbMock(
      characterRows: unknown[],
      publicRows: unknown[],
      profileUpdateReturning: unknown[] = [{ characterId: 'char-id' }],
    ) {
      let selectCalls = 0;
      const select = jest.fn().mockImplementation(() => {
        selectCalls++;
        if (selectCalls === 1) {
          // Ownership lookup: select().from().where().limit(1)
          return {
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(characterRows),
              }),
            }),
          };
        }
        // Re-read: select().from().leftJoin().where().limit(1)
        return {
          from: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(publicRows),
              }),
            }),
          }),
        };
      });

      const charSet = jest.fn().mockImplementation(() => ({
        where: jest.fn().mockResolvedValue([]),
      }));
      const profileSet = jest.fn().mockImplementation(() => ({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(profileUpdateReturning),
        }),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const update = jest.fn((table: any) => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: (table as any) === characters ? charSet : profileSet,
      }));
      const insertValues = jest.fn().mockResolvedValue([]);
      const insert = jest.fn().mockReturnValue({ values: insertValues });
      const transactionMock = jest.fn((cb: (tx: unknown) => unknown) => cb({ update, insert }));

      return { dbMock: { select, transaction: transactionMock }, charSet, profileSet, insert };
    }

    it('should update publicName and profile fields, returning the updated profile', async () => {
      const { dbMock, charSet, profileSet } = createUpdateDbMock([characterRow], [publicRow]);
      const service = createService(dbMock);

      const result = await service.updateProfile(ownerId, readableId, {
        publicName: 'Raichu',
        bio: 'Evolved electric mouse',
      });

      expect(result).toEqual(publicRow);
      expect(charSet).toHaveBeenCalledWith(
        expect.objectContaining({ publicName: 'Raichu', updatedAt: expect.any(Date) }),
      );
      expect(profileSet).toHaveBeenCalledWith(
        expect.objectContaining({ bio: 'Evolved electric mouse', updatedAt: expect.any(Date) }),
      );
      // Only provided fields are updated — never ownership or status.
      expect(charSet.mock.calls[0][0]).not.toHaveProperty('userId');
      expect(charSet.mock.calls[0][0]).not.toHaveProperty('status');
    });

    it('should support partial updates without touching the characters table', async () => {
      const { dbMock, charSet, profileSet } = createUpdateDbMock([characterRow], [publicRow]);
      const service = createService(dbMock);

      await service.updateProfile(ownerId, readableId, { signature: 'Gotta catch em all' });

      expect(charSet).not.toHaveBeenCalled();
      expect(profileSet).toHaveBeenCalledWith(
        expect.objectContaining({ signature: 'Gotta catch em all' }),
      );
    });

    it('should insert the profile row when none exists yet', async () => {
      const { dbMock, insert } = createUpdateDbMock([characterRow], [publicRow], []);
      const service = createService(dbMock);

      await service.updateProfile(ownerId, readableId, { bio: 'First bio' });

      expect(insert).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when the character does not exist', async () => {
      const { dbMock } = createUpdateDbMock([], []);
      const service = createService(dbMock);

      await expect(
        service.updateProfile(ownerId, 'NopeNopeNope000', { bio: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw ForbiddenError when the requester is not the owner', async () => {
      const { dbMock } = createUpdateDbMock([characterRow], []);
      const service = createService(dbMock);

      await expect(
        service.updateProfile(otherUserId, readableId, { bio: 'hijack' }),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('should throw ForbiddenError when the character is banned', async () => {
      const bannedRow = { ...characterRow, status: 'banned' };
      const { dbMock } = createUpdateDbMock([bannedRow], []);
      const service = createService(dbMock);

      await expect(service.updateProfile(ownerId, readableId, { bio: 'x' })).rejects.toBeInstanceOf(
        ForbiddenError,
      );
    });
  });

  describe('changeReadableId', () => {
    const currentReadableId = 'GreenAppleHunter123';
    const newReadableId = 'BlueOceanRunner456';
    const ownerId = '11111111-1111-4111-8111-111111111111';
    const otherUserId = '99999999-9999-4999-8999-999999999999';
    const characterRow = {
      id: 'char-id',
      userId: ownerId,
      readableId: currentReadableId,
      readableIdChanged: false,
      status: 'active',
    };
    const publicRow = {
      readableId: newReadableId,
      publicName: 'Pikachu',
      bio: 'Electric mouse',
      avatarUrl: null,
      customTitle: null,
      signature: null,
      createdAt: new Date('2026-10-15T00:00:00.000Z'),
    };

    function createChangeIdDbMock(
      characterRows: unknown[],
      existingRows: unknown[],
      publicRows: unknown[],
    ) {
      let simpleSelects = 0;
      const select = jest.fn().mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fromResult: any = {};
        fromResult.leftJoin = jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(publicRows),
          }),
        });
        fromResult.where = jest.fn().mockReturnValue({
          limit: jest.fn().mockImplementation(() => {
            simpleSelects++;
            // 1st plain select is the ownership lookup, 2nd is the uniqueness check.
            return Promise.resolve(simpleSelects === 1 ? characterRows : existingRows);
          }),
        });
        return { from: jest.fn().mockReturnValue(fromResult) };
      });

      const updateWhere = jest.fn().mockResolvedValue([]);
      const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
      const update = jest.fn().mockReturnValue({ set: updateSet });

      return { dbMock: { select, update }, updateSet, updateWhere };
    }

    it('should rename the character, set the flag and return the updated profile', async () => {
      const { dbMock, updateSet } = createChangeIdDbMock([characterRow], [], [publicRow]);
      const service = createService(dbMock);

      const result = await service.changeReadableId(ownerId, currentReadableId, {
        readableId: newReadableId,
      });

      expect(result).toEqual(publicRow);
      expect(updateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          readableId: newReadableId,
          readableIdChanged: true,
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should return the current profile without renaming when the id is unchanged', async () => {
      const currentRow = { ...publicRow, readableId: currentReadableId };
      const { dbMock, updateSet } = createChangeIdDbMock([characterRow], [], [currentRow]);
      const service = createService(dbMock);

      const result = await service.changeReadableId(ownerId, currentReadableId, {
        readableId: currentReadableId,
      });

      expect(result).toEqual(currentRow);
      expect(updateSet).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when the character does not exist', async () => {
      const { dbMock } = createChangeIdDbMock([], [], []);
      const service = createService(dbMock);

      await expect(
        service.changeReadableId(ownerId, 'NopeNopeNope000', { readableId: newReadableId }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError when the character is deleted (same as missing)', async () => {
      // Deleted rows are filtered in the WHERE clause, so the db returns [].
      const { dbMock } = createChangeIdDbMock([], [], []);
      const service = createService(dbMock);

      await expect(
        service.changeReadableId(ownerId, currentReadableId, { readableId: newReadableId }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw ForbiddenError when the requester is not the owner', async () => {
      const { dbMock } = createChangeIdDbMock([characterRow], [], []);
      const service = createService(dbMock);

      await expect(
        service.changeReadableId(otherUserId, currentReadableId, { readableId: newReadableId }),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('should throw ForbiddenError when the character is banned', async () => {
      const bannedRow = { ...characterRow, status: 'banned' };
      const { dbMock } = createChangeIdDbMock([bannedRow], [], []);
      const service = createService(dbMock);

      await expect(
        service.changeReadableId(ownerId, currentReadableId, { readableId: newReadableId }),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('should throw ForbiddenError when the id was already changed once', async () => {
      const changedRow = { ...characterRow, readableIdChanged: true };
      const { dbMock, updateSet } = createChangeIdDbMock([changedRow], [], []);
      const service = createService(dbMock);

      await expect(
        service.changeReadableId(ownerId, currentReadableId, { readableId: newReadableId }),
      ).rejects.toBeInstanceOf(ForbiddenError);
      expect(updateSet).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when the new id is already taken', async () => {
      const { dbMock, updateSet } = createChangeIdDbMock(
        [characterRow],
        [{ id: 'other-char-id' }],
        [],
      );
      const service = createService(dbMock);

      await expect(
        service.changeReadableId(ownerId, currentReadableId, { readableId: newReadableId }),
      ).rejects.toBeInstanceOf(ConflictError);
      expect(updateSet).not.toHaveBeenCalled();
    });
  });

  describe('setMainCharacter', () => {
    const readableId = 'GreenAppleHunter123';
    const ownerId = '11111111-1111-4111-8111-111111111111';
    const otherUserId = '99999999-9999-4999-8999-999999999999';
    const characterRow = {
      id: 'char-id',
      userId: ownerId,
      status: 'active',
      isMainCharacter: false,
    };
    const fullRow = {
      id: 'char-id',
      readableId,
      publicName: 'Pikachu',
      status: 'active',
      isMainCharacter: true,
      bio: 'Electric mouse',
      createdAt: new Date('2026-10-15T00:00:00.000Z'),
    };

    function createSetMainDbMock(characterRows: unknown[], fullRows: unknown[]) {
      const select = jest.fn().mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fromResult: any = {};
        fromResult.leftJoin = jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(fullRows),
          }),
        });
        fromResult.where = jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(characterRows),
        });
        return { from: jest.fn().mockReturnValue(fromResult) };
      });

      const updateWhere = jest.fn().mockResolvedValue([]);
      const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
      const update = jest.fn().mockReturnValue({ set: updateSet });
      const transactionMock = jest.fn((cb: (tx: unknown) => unknown) => cb({ update }));

      return {
        dbMock: { select, transaction: transactionMock },
        transactionMock,
        updateSet,
      };
    }

    it('should clear the previous main and set the target as main in one transaction', async () => {
      const { dbMock, transactionMock, updateSet } = createSetMainDbMock([characterRow], [fullRow]);
      const service = createService(dbMock);

      const result = await service.setMainCharacter(ownerId, readableId);

      expect(result).toEqual(fullRow);
      expect(transactionMock).toHaveBeenCalledTimes(1);
      expect(updateSet).toHaveBeenCalledTimes(2);
      expect(updateSet).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ isMainCharacter: false, updatedAt: expect.any(Date) }),
      );
      expect(updateSet).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ isMainCharacter: true, updatedAt: expect.any(Date) }),
      );
    });

    it('should return the character without writes when it is already main', async () => {
      const mainRow = { ...characterRow, isMainCharacter: true };
      const { dbMock, transactionMock } = createSetMainDbMock([mainRow], [fullRow]);
      const service = createService(dbMock);

      const result = await service.setMainCharacter(ownerId, readableId);

      expect(result).toEqual(fullRow);
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when the character does not exist', async () => {
      const { dbMock } = createSetMainDbMock([], []);
      const service = createService(dbMock);

      await expect(service.setMainCharacter(ownerId, 'NopeNopeNope000')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it('should throw NotFoundError when the character is deleted (same as missing)', async () => {
      // Deleted rows are filtered in the WHERE clause, so the db returns [].
      const { dbMock } = createSetMainDbMock([], []);
      const service = createService(dbMock);

      await expect(service.setMainCharacter(ownerId, readableId)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it('should throw ForbiddenError when the requester is not the owner', async () => {
      const { dbMock, transactionMock } = createSetMainDbMock([characterRow], []);
      const service = createService(dbMock);

      await expect(service.setMainCharacter(otherUserId, readableId)).rejects.toBeInstanceOf(
        ForbiddenError,
      );
      expect(transactionMock).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when the character is banned', async () => {
      const bannedRow = { ...characterRow, status: 'banned' };
      const { dbMock, transactionMock } = createSetMainDbMock([bannedRow], []);
      const service = createService(dbMock);

      await expect(service.setMainCharacter(ownerId, readableId)).rejects.toBeInstanceOf(
        ForbiddenError,
      );
      expect(transactionMock).not.toHaveBeenCalled();
    });
  });

  describe('deleteCharacter', () => {
    const readableId = 'GreenAppleHunter123';
    const ownerId = '11111111-1111-4111-8111-111111111111';
    const otherUserId = '99999999-9999-4999-8999-999999999999';
    const characterRow = {
      id: 'char-id',
      userId: ownerId,
      status: 'active',
      deletedAt: null,
    };

    function createDeleteDbMock(characterRows: unknown[]) {
      const select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(characterRows),
          }),
        }),
      });

      const updateWhere = jest.fn().mockResolvedValue([]);
      const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
      const update = jest.fn().mockReturnValue({ set: updateSet });

      return { dbMock: { select, update }, updateSet, updateWhere };
    }

    it('should soft delete the character when the requester is the owner', async () => {
      const { dbMock, updateSet } = createDeleteDbMock([characterRow]);
      const service = createService(dbMock);

      await service.deleteCharacter(ownerId, 'user', readableId);

      expect(updateSet).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'deleted',
          deletedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should soft delete when the requester is an admin', async () => {
      const { dbMock, updateSet } = createDeleteDbMock([characterRow]);
      const service = createService(dbMock);

      await service.deleteCharacter(otherUserId, 'admin', readableId);

      expect(updateSet).toHaveBeenCalledTimes(1);
    });

    it('should soft delete when the requester is a webmaster', async () => {
      const { dbMock, updateSet } = createDeleteDbMock([characterRow]);
      const service = createService(dbMock);

      await service.deleteCharacter(otherUserId, 'webmaster', readableId);

      expect(updateSet).toHaveBeenCalledTimes(1);
    });

    it('should soft delete a banned character (delete is not interaction)', async () => {
      const bannedRow = { ...characterRow, status: 'banned' };
      const { dbMock, updateSet } = createDeleteDbMock([bannedRow]);
      const service = createService(dbMock);

      await service.deleteCharacter(ownerId, 'user', readableId);

      expect(updateSet).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when the character does not exist', async () => {
      const { dbMock, updateSet } = createDeleteDbMock([]);
      const service = createService(dbMock);

      await expect(
        service.deleteCharacter(ownerId, 'user', 'NopeNopeNope000'),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(updateSet).not.toHaveBeenCalled();
    });

    it('should resolve without writes when the character is already deleted', async () => {
      const deletedRow = {
        ...characterRow,
        status: 'deleted',
        deletedAt: new Date('2026-10-15T00:00:00.000Z'),
      };
      const { dbMock, updateSet } = createDeleteDbMock([deletedRow]);
      const service = createService(dbMock);

      await expect(service.deleteCharacter(ownerId, 'user', readableId)).resolves.toBeUndefined();
      expect(updateSet).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when the requester is neither owner nor admin', async () => {
      const { dbMock, updateSet } = createDeleteDbMock([characterRow]);
      const service = createService(dbMock);

      await expect(service.deleteCharacter(otherUserId, 'user', readableId)).rejects.toBeInstanceOf(
        ForbiddenError,
      );
      expect(updateSet).not.toHaveBeenCalled();
    });
  });

  describe('getCharacterTopics', () => {
    const readableId = 'GreenAppleHunter123';
    const characterRow = { id: 'char-id' };
    const topicRows = [
      {
        id: 'topic-id-1',
        title: 'Best starter?',
        forumName: 'General Discussion',
        replyCount: 5,
        createdAt: new Date('2026-10-15T00:00:00.000Z'),
      },
    ];

    function createTopicsDbMock(characterRows: unknown[], rows: unknown[]) {
      let selectCalls = 0;
      const offset = jest.fn().mockResolvedValue(rows);
      const limit = jest.fn().mockReturnValue({ offset });
      const orderBy = jest.fn().mockReturnValue({ limit });
      const topicsWhere = jest.fn().mockReturnValue({ orderBy });
      const innerJoin = jest.fn().mockReturnValue({ where: topicsWhere });
      const lookupWhere = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(characterRows),
      });
      const select = jest.fn().mockImplementation(() => {
        selectCalls++;
        if (selectCalls === 1) {
          // Character lookup: select().from().where().limit(1)
          return { from: jest.fn().mockReturnValue({ where: lookupWhere }) };
        }
        // Topics query: select().from().innerJoin().where().orderBy().limit().offset()
        return { from: jest.fn().mockReturnValue({ innerJoin }) };
      });

      return { dbMock: { select }, lookupWhere, topicsWhere, orderBy, limit, offset };
    }

    it("should return the character's topics newest first", async () => {
      const { dbMock } = createTopicsDbMock([characterRow], topicRows);
      const service = createService(dbMock);

      const result = await service.getCharacterTopics(readableId, { page: 1, limit: 20 });

      expect(result).toEqual(topicRows);
    });

    it('should apply pagination as limit and offset', async () => {
      const { dbMock, limit, offset } = createTopicsDbMock([characterRow], []);
      const service = createService(dbMock);

      await service.getCharacterTopics(readableId, { page: 2, limit: 10 });

      expect(limit).toHaveBeenCalledWith(10);
      expect(offset).toHaveBeenCalledWith(10);
    });

    it('should return an empty array when the character has no topics', async () => {
      const { dbMock } = createTopicsDbMock([characterRow], []);
      const service = createService(dbMock);

      await expect(service.getCharacterTopics(readableId, { page: 1, limit: 20 })).resolves.toEqual(
        [],
      );
    });

    it('should throw NotFoundError when the character does not exist', async () => {
      const { dbMock } = createTopicsDbMock([], []);
      const service = createService(dbMock);

      await expect(
        service.getCharacterTopics('NopeNopeNope000', { page: 1, limit: 20 }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError when the character is deleted or banned (same as missing)', async () => {
      // Non-active rows are filtered in the WHERE clause, so the db returns [].
      const { dbMock, lookupWhere } = createTopicsDbMock([], []);
      const service = createService(dbMock);

      await expect(
        service.getCharacterTopics(readableId, { page: 1, limit: 20 }),
      ).rejects.toBeInstanceOf(NotFoundError);
      expect(lookupWhere).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCharacterFriends', () => {
    const readableId = 'GreenAppleHunter123';
    const characterRow = { id: 'char-id' };
    const friendRow = (readableId: string, publicName: string, friendshipCreatedAt: string) => ({
      readableId,
      publicName,
      avatarUrl: null,
      friendshipCreatedAt: new Date(friendshipCreatedAt),
    });

    function createFriendsDbMock(
      characterRows: unknown[],
      requesterRows: unknown[],
      addresseeRows: unknown[],
    ) {
      let selectCalls = 0;
      const select = jest.fn().mockImplementation(() => {
        selectCalls++;
        if (selectCalls === 1) {
          // Character lookup: select().from().where().limit(1)
          return {
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(characterRows),
              }),
            }),
          };
        }
        // Friendship direction query: select().from().innerJoin().leftJoin().where().orderBy()
        const rows = selectCalls === 2 ? requesterRows : addresseeRows;
        return {
          from: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnValue({
                where: jest.fn().mockReturnValue({
                  orderBy: jest.fn().mockResolvedValue(rows),
                }),
              }),
            }),
          }),
        };
      });

      return { dbMock: { select } };
    }

    it('should merge friends from both directions newest first', async () => {
      const requesterRows = [friendRow('OldFriend111', 'Bulbasaur', '2026-10-10T00:00:00.000Z')];
      const addresseeRows = [friendRow('NewFriend222', 'Charmander', '2026-10-15T00:00:00.000Z')];
      const { dbMock } = createFriendsDbMock([characterRow], requesterRows, addresseeRows);
      const service = createService(dbMock);

      const result = await service.getCharacterFriends(readableId, { page: 1, limit: 20 });

      expect(result).toEqual([
        { readableId: 'NewFriend222', publicName: 'Charmander', avatarUrl: null },
        { readableId: 'OldFriend111', publicName: 'Bulbasaur', avatarUrl: null },
      ]);
    });

    it('should apply pagination after merging', async () => {
      const requesterRows = [
        friendRow('Friend111', 'Bulbasaur', '2026-10-10T00:00:00.000Z'),
        friendRow('Friend222', 'Ivysaur', '2026-10-11T00:00:00.000Z'),
      ];
      const addresseeRows = [friendRow('Friend333', 'Venusaur', '2026-10-12T00:00:00.000Z')];
      const { dbMock } = createFriendsDbMock([characterRow], requesterRows, addresseeRows);
      const service = createService(dbMock);

      const result = await service.getCharacterFriends(readableId, { page: 2, limit: 2 });

      expect(result).toEqual([
        { readableId: 'Friend111', publicName: 'Bulbasaur', avatarUrl: null },
      ]);
    });

    it('should return an empty array when the character has no friends', async () => {
      const { dbMock } = createFriendsDbMock([characterRow], [], []);
      const service = createService(dbMock);

      await expect(
        service.getCharacterFriends(readableId, { page: 1, limit: 20 }),
      ).resolves.toEqual([]);
    });

    it('should throw NotFoundError when the character does not exist', async () => {
      const { dbMock } = createFriendsDbMock([], [], []);
      const service = createService(dbMock);

      await expect(
        service.getCharacterFriends('NopeNopeNope000', { page: 1, limit: 20 }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw NotFoundError when the character is deleted or banned (same as missing)', async () => {
      // Non-active rows are filtered in the WHERE clause, so the db returns [].
      const { dbMock } = createFriendsDbMock([], [], []);
      const service = createService(dbMock);

      await expect(
        service.getCharacterFriends(readableId, { page: 1, limit: 20 }),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
