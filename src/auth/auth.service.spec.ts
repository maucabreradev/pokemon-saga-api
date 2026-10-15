import * as bcrypt from 'bcrypt';
import { ConflictError } from '../common/exceptions/app-errors';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

// database.module pulls @nestjs/config (ESM-only dist) which unit Jest (CJS)
// cannot parse. The DRIZZLE token carries no runtime behavior relevant here,
// so the module is stubbed and the db connection is injected as a manual mock.
jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

const mockedHash = bcrypt.hash as jest.Mock;

function createDbMock(existingRows: Array<{ id: string }> = [], createdRow = {}) {
  return {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(existingRows),
        }),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([createdRow]),
      }),
    }),
  };
}

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a user with a hashed password and return the public profile', async () => {
      const dto: RegisterDto = {
        email: 'ash.ketchum@pallettown.gg',
        password: 'pikachu-25-forever',
      };
      const createdRow = {
        id: '11111111-1111-4111-8111-111111111111',
        email: dto.email,
        role: 'user',
        createdAt: new Date('2026-10-15T00:00:00.000Z'),
      };

      const dbMock = createDbMock([], createdRow);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AuthService(dbMock as any);
      mockedHash.mockResolvedValue('hashed-password');

      const result = await service.register(dto);

      expect(mockedHash).toHaveBeenCalledWith(dto.password, 12);
      expect(dbMock.insert).toHaveBeenCalled();
      expect(result).toEqual(createdRow);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictError when the email is already registered', async () => {
      const dto: RegisterDto = {
        email: 'ash.ketchum@pallettown.gg',
        password: 'pikachu-25-forever',
      };

      const dbMock = createDbMock([{ id: 'existing-id' }]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AuthService(dbMock as any);

      await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictError);
      expect(dbMock.insert).not.toHaveBeenCalled();
      expect(mockedHash).not.toHaveBeenCalled();
    });
  });
});
