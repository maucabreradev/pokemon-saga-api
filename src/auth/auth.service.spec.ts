import * as bcrypt from 'bcrypt';
import { ConflictError, UnauthorizedError } from '../common/exceptions/app-errors';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// @nestjs/jwt ships ESM-only dist that Jest (CJS) cannot parse.
// JwtService is injected as a manual mock, so the module is stubbed.
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

// database.module pulls @nestjs/config (ESM-only dist) which unit Jest (CJS)
// cannot parse. The DRIZZLE token carries no runtime behavior relevant here,
// so the module is stubbed and the db connection is injected as a manual mock.
jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

const mockedHash = bcrypt.hash as jest.Mock;
const mockedCompare = bcrypt.compare as jest.Mock;

function createService(dbMock: unknown, jwtMock: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new AuthService(dbMock as any, jwtMock as any);
}

function createJwtMock() {
  return { signAsync: jest.fn() };
}

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
      const service = createService(dbMock, createJwtMock());
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
      const service = createService(dbMock, createJwtMock());

      await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictError);
      expect(dbMock.insert).not.toHaveBeenCalled();
      expect(mockedHash).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto: LoginDto = {
      email: 'ash.ketchum@pallettown.gg',
      password: 'pikachu-25-forever',
    };
    const userRow = {
      id: '11111111-1111-4111-8111-111111111111',
      email: dto.email,
      passwordHash: 'stored-hash',
      role: 'user' as const,
    };

    it('should return an access token for valid credentials', async () => {
      const dbMock = createDbMock([userRow]);
      const jwtMock = createJwtMock();
      const service = createService(dbMock, jwtMock);
      mockedCompare.mockResolvedValue(true);
      jwtMock.signAsync.mockResolvedValue('signed-access-token');

      const result = await service.login(dto);

      expect(mockedCompare).toHaveBeenCalledWith(dto.password, userRow.passwordHash);
      expect(jwtMock.signAsync).toHaveBeenCalledWith({
        sub: userRow.id,
        email: userRow.email,
        role: userRow.role,
      });
      expect(result).toEqual({ accessToken: 'signed-access-token' });
    });

    it('should throw UnauthorizedError when the email is unknown', async () => {
      const dbMock = createDbMock([]);
      const jwtMock = createJwtMock();
      const service = createService(dbMock, jwtMock);

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedError);
      expect(mockedCompare).not.toHaveBeenCalled();
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when the password is wrong', async () => {
      const dbMock = createDbMock([userRow]);
      const jwtMock = createJwtMock();
      const service = createService(dbMock, jwtMock);
      mockedCompare.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedError);
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });
});
