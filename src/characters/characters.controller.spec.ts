import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';

jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiCreatedResponse: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiNotFoundResponse: () => () => undefined,
  ApiBadRequestResponse: () => () => undefined,
  ApiUnauthorizedResponse: () => () => undefined,
  ApiForbiddenResponse: () => () => undefined,
  ApiBearerAuth: () => () => undefined,
  ApiParam: () => () => undefined,
}));

jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

describe('CharactersController', () => {
  let controller: CharactersController;
  let service: { create: jest.Mock; getPublicProfile: jest.Mock };

  beforeEach(() => {
    service = { create: jest.fn(), getPublicProfile: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controller = new CharactersController(service as any as CharactersService);
  });

  describe('create', () => {
    it('should delegate to the service with the current user id and dto', async () => {
      const userId = '11111111-1111-4111-8111-111111111111';
      const dto: CreateCharacterDto = { publicName: 'Pikachu', bio: 'Electric mouse' };
      const created = {
        id: 'new-char-id',
        readableId: 'GreenAppleHunter123',
        publicName: dto.publicName,
        status: 'active',
        isMainCharacter: true,
        bio: dto.bio,
        createdAt: new Date(),
      };
      service.create.mockResolvedValue(created);

      await expect(controller.create(userId, dto)).resolves.toEqual(created);
      expect(service.create).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('getByReadableId', () => {
    it('should delegate to the service with the readable id', async () => {
      const readableId = 'GreenAppleHunter123';
      const profile = {
        readableId,
        publicName: 'Pikachu',
        bio: 'Electric mouse',
        avatarUrl: null,
        customTitle: null,
        signature: null,
        createdAt: new Date(),
      };
      service.getPublicProfile.mockResolvedValue(profile);

      await expect(controller.getByReadableId(readableId)).resolves.toEqual(profile);
      expect(service.getPublicProfile).toHaveBeenCalledWith(readableId);
    });
  });
});
