import { PostsController } from './posts.controller';

jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiCreatedResponse: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiNoContentResponse: () => () => undefined,
  ApiParam: () => () => undefined,
  ApiBadRequestResponse: () => () => undefined,
  ApiBearerAuth: () => () => undefined,
  ApiUnauthorizedResponse: () => () => undefined,
  ApiForbiddenResponse: () => () => undefined,
  ApiNotFoundResponse: () => () => undefined,
}));

// database.module pulls @nestjs/config (ESM-only dist) which unit Jest (CJS)
// cannot parse. It is stubbed here; PostsService itself is injected as a manual mock.
jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

describe('PostsController', () => {
  describe('createPost', () => {
    it('should delegate the create with the dto and user id', async () => {
      // Arrange
      const dto = { topicId: 'topic-id-1', body: 'I pick Bulbasaur.' };
      const created = { id: 'post-id-1', topicId: 'topic-id-1' };
      const serviceMock = { createPost: jest.fn().mockResolvedValue(created) };
      const controller = new PostsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.createPost(dto, 'user-id-1');

      // Assert
      expect(serviceMock.createPost).toHaveBeenCalledWith(dto, 'user-id-1');
      expect(result).toBe(created);
    });
  });

  describe('getPostDetail', () => {
    it('should return the post detail from the service', async () => {
      // Arrange
      const id = 'post-id-1';
      const detail = { id, topicId: 'topic-id-1', replyCount: 0 };
      const serviceMock = { getPostDetail: jest.fn().mockResolvedValue(detail) };
      const controller = new PostsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.getPostDetail(id);

      // Assert
      expect(serviceMock.getPostDetail).toHaveBeenCalledWith(id);
      expect(result).toBe(detail);
    });
  });

  describe('updatePost', () => {
    it('should delegate the update with the dto, user id and role', async () => {
      // Arrange
      const id = 'post-id-1';
      const dto = { body: 'Updated reply.' };
      const updated = { id, topicId: 'topic-id-1', body: 'Updated reply.' };
      const serviceMock = { updatePost: jest.fn().mockResolvedValue(updated) };
      const controller = new PostsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.updatePost(id, 'user-id-1', 'user', dto);

      // Assert
      expect(serviceMock.updatePost).toHaveBeenCalledWith(id, 'user-id-1', 'user', dto);
      expect(result).toBe(updated);
    });
  });

  describe('deletePost', () => {
    it('should delegate the delete with the user id and role', async () => {
      // Arrange
      const id = 'post-id-1';
      const serviceMock = { deletePost: jest.fn().mockResolvedValue(undefined) };
      const controller = new PostsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.deletePost(id, 'user-id-1', 'admin');

      // Assert
      expect(serviceMock.deletePost).toHaveBeenCalledWith(id, 'user-id-1', 'admin');
      expect(result).toBeUndefined();
    });
  });
});
