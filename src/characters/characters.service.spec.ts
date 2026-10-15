import { ForbiddenError, NotFoundError } from '../common/exceptions/app-errors';
import { CharactersService } from './characters.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const characters = {} as any;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const charactersProfile = {} as any;

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

function makeInsertMock(returningValue: unknown) {
  return {
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue(returningValue),
    }),
  };
}

function createDbMock(userRows: unknown[] = [], countRows: unknown[] = []) {
  const limitMock = jest.fn().mockResolvedValueOnce(userRows).mockResolvedValueOnce(countRows);

  const charReturning = [
    {
      id: 'new-char-id',
      readableId: 'GreenAppleHunter123',
      publicName: 'Pikachu',
      status: 'active',
      isMainCharacter: true,
      createdAt: new Date(),
    },
  ];

  const insertMock = makeInsertMock(charReturning);

  const txInsert = jest.fn((_table: any) => insertMock);

  const txUpdate = jest.fn((_table: any) => ({
    set: jest.fn().mockReturnValue({ where: jest.fn() }),
  }));

  const _transactionMock = jest.fn((cb: (tx: unknown) => unknown) =>
    cb({ insert: txInsert, update: txUpdate }),
  );

  return {
    dbMock: {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ limit: limitMock }),
        }),
      }),
      transaction: _transactionMock,
    },
    limitMock,
    _transactionMock,
    txInsert,
  };
}

function createService(dbMock: unknown) {
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

    it('should create character with profile, generate readableId, set isMainCharacter=true for first character', async () => {
      const { dbMock, _transactionMock, txInsert } = createDbMock([userRow], []);
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

      expect(_transactionMock).toHaveBeenCalled();
      expect(txInsert).toHaveBeenCalledTimes(2);
    });

    it('should set isMainCharacter=false when user already has characters', async () => {
      const { dbMock } = createDbMock([userRow], [{ id: 'char1' }]);
      const service = createService(dbMock);

      const { generateUniqueReadableId } = jest.requireMock(
        '../common/utils/readable-id-generator',
      );
      generateUniqueReadableId.mockResolvedValue('BlueOceanRunner456');

      const result = await service.create(userId, dto);

      expect(result.isMainCharacter).toBe(false);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const { dbMock } = createDbMock([]);
      const service = createService(dbMock);

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw ForbiddenError when user already has 3 active characters', async () => {
      const threeChars = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const { dbMock } = createDbMock([userRow], threeChars);
      const service = createService(dbMock);

      await expect(service.create(userId, dto)).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('should retry readableId generation on collision', async () => {
      const { dbMock } = createDbMock([userRow], []);
      const service = createService(dbMock);

      const { generateUniqueReadableId } = jest.requireMock(
        '../common/utils/readable-id-generator',
      );
      generateUniqueReadableId
        .mockResolvedValueOnce('collision-id')
        .mockResolvedValueOnce('FinalUniqueId789');

      const result = await service.create(userId, dto);

      expect(result.readableId).toBe('FinalUniqueId789');
    });
  });
});
