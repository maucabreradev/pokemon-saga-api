import { ForbiddenError, NotFoundError } from '../common/exceptions/app-errors';
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
});
