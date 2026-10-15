import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

// @nestjs/swagger ships ESM-only dist that Jest (CJS) cannot parse.
// The Swagger decorators carry no runtime behavior relevant to this test,
// so they are stubbed out with no-op decorator factories.
jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiResponse: () => () => undefined,
  ApiCreatedResponse: () => () => undefined,
  ApiConflictResponse: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiUnauthorizedResponse: () => () => undefined,
}));

// @nestjs/jwt ships ESM-only dist that Jest (CJS) cannot parse.
// It is stubbed here; AuthService itself is injected as a manual mock.
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

// @nestjs/config is imported by AuthService and ships ESM-only dist.
// It carries no runtime behavior relevant here, so it is stubbed too.
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn(),
}));

// database.module pulls @nestjs/config (ESM-only dist) which unit Jest (CJS)
// cannot parse. It is stubbed here; AuthService itself is injected as a manual mock.
jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let service: { register: jest.Mock; login: jest.Mock; refresh: jest.Mock };

  beforeEach(() => {
    service = { register: jest.fn(), login: jest.fn(), refresh: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controller = new AuthController(service as any as AuthService);
  });

  describe('register', () => {
    it('should delegate to the service and return the created user', async () => {
      const dto: RegisterDto = {
        email: 'ash.ketchum@pallettown.gg',
        password: 'pikachu-25-forever',
      };
      const created = {
        id: '11111111-1111-4111-8111-111111111111',
        email: dto.email,
        role: 'user',
        createdAt: new Date('2026-10-15T00:00:00.000Z'),
      };
      service.register.mockResolvedValue(created);

      await expect(controller.register(dto)).resolves.toEqual(created);
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should delegate to the service and return both tokens', async () => {
      const dto: LoginDto = {
        email: 'ash.ketchum@pallettown.gg',
        password: 'pikachu-25-forever',
      };
      const tokens = { accessToken: 'signed-access-token', refreshToken: 'raw-refresh-token' };
      service.login.mockResolvedValue(tokens);

      await expect(controller.login(dto)).resolves.toEqual(tokens);
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('refresh', () => {
    it('should delegate to the service and return the new token pair', async () => {
      const dto: RefreshDto = { refreshToken: 'old-raw-refresh-token' };
      const tokens = {
        accessToken: 'new-signed-access-token',
        refreshToken: 'new-raw-refresh-token',
      };
      service.refresh.mockResolvedValue(tokens);

      await expect(controller.refresh(dto)).resolves.toEqual(tokens);
      expect(service.refresh).toHaveBeenCalledWith(dto);
    });
  });
});
