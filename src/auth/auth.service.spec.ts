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

// @nestjs/config ships ESM-only dist that is already stubbed via database.module,
// but the ConfigService token is imported directly here, so it needs its own stub.
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn(),
}));

// database.module pulls @nestjs/config (ESM-only dist) which unit Jest (CJS)
// cannot parse. The DRIZZLE token carries no runtime behavior relevant here,
// so the module is stubbed and the db connection is injected as a manual mock.
jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

const mockedHash = bcrypt.hash as jest.Mock;
const mockedCompare = bcrypt.compare as jest.Mock;

function createService(dbMock: unknown, jwtMock: unknown, configMock: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new AuthService(dbMock as any, jwtMock as any, configMock as any);
}

function createJwtMock() {
  return { signAsync: jest.fn() };
}

function createConfigMock(refreshTokenExpiry = '30d') {
  return { getOrThrow: jest.fn().mockReturnValue(refreshTokenExpiry) };
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
      const service = createService(dbMock, createJwtMock(), createConfigMock());
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
      const service = createService(dbMock, createJwtMock(), createConfigMock());

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

    it('should return an access token and a refresh token for valid credentials', async () => {
      const dbMock = createDbMock([userRow]);
      const jwtMock = createJwtMock();
      const service = createService(dbMock, jwtMock, createConfigMock());
      mockedCompare.mockResolvedValue(true);
      jwtMock.signAsync.mockResolvedValue('signed-access-token');

      const result = await service.login(dto);

      expect(mockedCompare).toHaveBeenCalledWith(dto.password, userRow.passwordHash);
      expect(jwtMock.signAsync).toHaveBeenCalledWith({
        sub: userRow.id,
        email: userRow.email,
        role: userRow.role,
      });
      expect(result.accessToken).toBe('signed-access-token');
      expect(typeof result.refreshToken).toBe('string');
      expect(result.refreshToken.length).toBeGreaterThan(0);
    });

    it('should throw UnauthorizedError when the email is unknown', async () => {
      const dbMock = createDbMock([]);
      const jwtMock = createJwtMock();
      const service = createService(dbMock, jwtMock, createConfigMock());

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedError);
      expect(mockedCompare).not.toHaveBeenCalled();
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when the password is wrong', async () => {
      const dbMock = createDbMock([userRow]);
      const jwtMock = createJwtMock();
      const service = createService(dbMock, jwtMock, createConfigMock());
      mockedCompare.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toBeInstanceOf(UnauthorizedError);
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('issueRefreshToken', () => {
    const userId = '11111111-1111-4111-8111-111111111111';

    it('should store only the token hash with a future expiry and return the raw token', async () => {
      const { createHash } = jest.requireActual('crypto');
      const dbMock = createDbMock([], { id: 'token-row-id' });
      const service = createService(dbMock, createJwtMock(), createConfigMock('30d'));
      const before = Date.now();

      const token = await service.issueRefreshToken(userId);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      const storedValues = dbMock.insert().values.mock.calls[0][0];
      expect(storedValues.userId).toBe(userId);
      expect(storedValues.tokenHash).toBe(createHash('sha256').update(token).digest('hex'));
      expect(storedValues.tokenHash).not.toContain(token);
      const expiresAt = new Date(storedValues.expiresAt).getTime();
      expect(expiresAt - before).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
      expect(expiresAt - before).toBeLessThanOrEqual(30 * 24 * 60 * 60 * 1000 + 1000);
    });

    it('should respect a custom refresh token expiry', async () => {
      const dbMock = createDbMock([], { id: 'token-row-id' });
      const service = createService(dbMock, createJwtMock(), createConfigMock('1h'));
      const before = Date.now();

      await service.issueRefreshToken(userId);

      const storedValues = dbMock.insert().values.mock.calls[0][0];
      const expiresAt = new Date(storedValues.expiresAt).getTime();
      expect(expiresAt - before).toBeGreaterThan(59 * 60 * 1000);
      expect(expiresAt - before).toBeLessThanOrEqual(60 * 60 * 1000 + 1000);
    });

    it('should generate a different token on each call', async () => {
      const dbMock = createDbMock([], { id: 'token-row-id' });
      const service = createService(dbMock, createJwtMock(), createConfigMock());

      const first = await service.issueRefreshToken(userId);
      const second = await service.issueRefreshToken(userId);

      expect(first).not.toBe(second);
    });
  });
});
