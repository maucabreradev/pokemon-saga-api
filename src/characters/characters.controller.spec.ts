import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { UpdateReadableIdDto } from './dto/update-readable-id.dto';

jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiCreatedResponse: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiNotFoundResponse: () => () => undefined,
  ApiBadRequestResponse: () => () => undefined,
  ApiUnauthorizedResponse: () => () => undefined,
  ApiForbiddenResponse: () => () => undefined,
  ApiConflictResponse: () => () => undefined,
  ApiNoContentResponse: () => () => undefined,
  ApiBearerAuth: () => () => undefined,
  ApiParam: () => () => undefined,
  ApiQuery: () => () => undefined,
}));

jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

describe('CharactersController', () => {
  let controller: CharactersController;
  let service: {
    create: jest.Mock;
    getPublicProfile: jest.Mock;
    updateProfile: jest.Mock;
    changeReadableId: jest.Mock;
    setMainCharacter: jest.Mock;
    deleteCharacter: jest.Mock;
    getCharacterTopics: jest.Mock;
  };

  beforeEach(() => {
    service = {
      create: jest.fn(),
      getPublicProfile: jest.fn(),
      updateProfile: jest.fn(),
      changeReadableId: jest.fn(),
      setMainCharacter: jest.fn(),
      deleteCharacter: jest.fn(),
      getCharacterTopics: jest.fn(),
    };
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

  describe('updateProfile', () => {
    it('should delegate to the service with readable id, user id and dto', async () => {
      const userId = '11111111-1111-4111-8111-111111111111';
      const readableId = 'GreenAppleHunter123';
      const dto: UpdateCharacterDto = { publicName: 'Raichu', bio: 'Evolved' };
      const updated = {
        readableId,
        publicName: 'Raichu',
        bio: 'Evolved',
        avatarUrl: null,
        customTitle: null,
        signature: null,
        createdAt: new Date(),
      };
      service.updateProfile.mockResolvedValue(updated);

      await expect(controller.updateProfile(readableId, userId, dto)).resolves.toEqual(updated);
      expect(service.updateProfile).toHaveBeenCalledWith(userId, readableId, dto);
    });
  });

  describe('changeReadableId', () => {
    it('should delegate to the service with user id, current id and dto', async () => {
      const userId = '11111111-1111-4111-8111-111111111111';
      const readableId = 'GreenAppleHunter123';
      const dto: UpdateReadableIdDto = { readableId: 'BlueOceanRunner456' };
      const updated = {
        readableId: dto.readableId,
        publicName: 'Pikachu',
        bio: 'Electric mouse',
        avatarUrl: null,
        customTitle: null,
        signature: null,
        createdAt: new Date(),
      };
      service.changeReadableId.mockResolvedValue(updated);

      await expect(controller.changeReadableId(readableId, userId, dto)).resolves.toEqual(updated);
      expect(service.changeReadableId).toHaveBeenCalledWith(userId, readableId, dto);
    });
  });

  describe('setMainCharacter', () => {
    it('should delegate to the service with user id and readable id', async () => {
      const userId = '11111111-1111-4111-8111-111111111111';
      const readableId = 'GreenAppleHunter123';
      const updated = {
        id: 'char-id',
        readableId,
        publicName: 'Pikachu',
        status: 'active',
        isMainCharacter: true,
        bio: 'Electric mouse',
        createdAt: new Date(),
      };
      service.setMainCharacter.mockResolvedValue(updated);

      await expect(controller.setMainCharacter(readableId, userId)).resolves.toEqual(updated);
      expect(service.setMainCharacter).toHaveBeenCalledWith(userId, readableId);
    });
  });

  describe('deleteCharacter', () => {
    it('should delegate to the service with user id, role and readable id', async () => {
      const userId = '11111111-1111-4111-8111-111111111111';
      const readableId = 'GreenAppleHunter123';
      service.deleteCharacter.mockResolvedValue(undefined);

      await expect(controller.deleteCharacter(readableId, userId, 'user')).resolves.toBeUndefined();
      expect(service.deleteCharacter).toHaveBeenCalledWith(userId, 'user', readableId);
    });
  });

  describe('getCharacterTopics', () => {
    it('should delegate to the service with readable id and query', async () => {
      const readableId = 'GreenAppleHunter123';
      const query = { page: 2, limit: 10 };
      const rows = [
        {
          id: 'topic-id-1',
          title: 'Best starter?',
          forumName: 'General Discussion',
          replyCount: 5,
          createdAt: new Date(),
        },
      ];
      service.getCharacterTopics.mockResolvedValue(rows);

      await expect(controller.getCharacterTopics(readableId, query)).resolves.toEqual(rows);
      expect(service.getCharacterTopics).toHaveBeenCalledWith(readableId, query);
    });
  });
});
