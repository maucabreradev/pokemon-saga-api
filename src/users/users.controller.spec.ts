import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

// @nestjs/swagger ships ESM-only dist that Jest (CJS) cannot parse.
// The Swagger decorators carry no runtime behavior relevant to this test,
// so they are stubbed out with no-op decorator factories.
jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiUnauthorizedResponse: () => () => undefined,
  ApiNotFoundResponse: () => () => undefined,
  ApiBearerAuth: () => () => undefined,
  ApiBadRequestResponse: () => () => undefined,
  ApiConflictResponse: () => () => undefined,
}));

// database.module pulls @nestjs/config (ESM-only dist) which unit Jest (CJS)
// cannot parse. It is stubbed here; UsersService itself is injected as a manual mock.
jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

describe('UsersController', () => {
  let controller: UsersController;
  let service: { getMe: jest.Mock; updateEmail: jest.Mock };

  beforeEach(() => {
    service = { getMe: jest.fn(), updateEmail: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controller = new UsersController(service as any as UsersService);
  });

  describe('getMe', () => {
    it('should delegate to the service with the current user id', async () => {
      const userId = '11111111-1111-4111-8111-111111111111';
      const profile = {
        id: userId,
        email: 'ash.ketchum@pallettown.gg',
        role: 'user' as const,
        createdAt: new Date('2026-10-15T00:00:00.000Z'),
      };
      service.getMe.mockResolvedValue(profile);

      await expect(controller.getMe(userId)).resolves.toEqual(profile);
      expect(service.getMe).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateMe', () => {
    it('should delegate to the service with the current user id and dto', async () => {
      const userId = '11111111-1111-4111-8111-111111111111';
      const dto: UpdateUserDto = { email: 'misty.cerulean@pallettown.gg' };
      const profile = {
        id: userId,
        email: dto.email,
        role: 'user' as const,
        createdAt: new Date('2026-10-15T00:00:00.000Z'),
      };
      service.updateEmail.mockResolvedValue(profile);

      await expect(controller.updateMe(userId, dto)).resolves.toEqual(profile);
      expect(service.updateEmail).toHaveBeenCalledWith(userId, dto.email);
    });
  });
});
