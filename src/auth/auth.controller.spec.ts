import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
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
}));

// database.module pulls @nestjs/config (ESM-only dist) which unit Jest (CJS)
// cannot parse. It is stubbed here; AuthService itself is injected as a manual mock.
jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let service: { register: jest.Mock };

  beforeEach(() => {
    service = { register: jest.fn() };
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
});
