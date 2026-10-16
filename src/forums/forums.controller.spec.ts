import { ForumsController } from './forums.controller';

jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiNotFoundResponse: () => () => undefined,
  ApiParam: () => () => undefined,
  ApiBearerAuth: () => () => undefined,
  ApiCreatedResponse: () => () => undefined,
  ApiBadRequestResponse: () => () => undefined,
  ApiUnauthorizedResponse: () => () => undefined,
  ApiForbiddenResponse: () => () => undefined,
  ApiNoContentResponse: () => () => undefined,
  ApiConflictResponse: () => () => undefined,
}));

jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

describe('ForumsController', () => {
  describe('getTree', () => {
    it('should return the category/forum tree from the service', async () => {
      // Arrange
      const tree = [
        {
          id: 'cat-1',
          name: 'General',
          description: null,
          visibility: 'public',
          displayOrder: 0,
          forums: [],
        },
      ];
      const serviceMock = { getTree: jest.fn().mockResolvedValue(tree) };
      const controller = new ForumsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.getTree();

      // Assert
      expect(serviceMock.getTree).toHaveBeenCalledTimes(1);
      expect(result).toBe(tree);
    });
  });

  describe('getForumDetail', () => {
    it('should return the forum detail from the service', async () => {
      // Arrange
      const detail = {
        id: 'forum-1',
        name: 'Announcements',
        description: null,
        visibility: 'public',
        displayOrder: 0,
        subForums: [],
        breadcrumb: [],
        topicCount: 0,
      };
      const serviceMock = { getForumDetail: jest.fn().mockResolvedValue(detail) };
      const controller = new ForumsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.getForumDetail('forum-1');

      // Assert
      expect(serviceMock.getForumDetail).toHaveBeenCalledWith('forum-1');
      expect(result).toBe(detail);
    });
  });

  describe('createCategory', () => {
    it('should return the created category from the service', async () => {
      // Arrange
      const dto = { name: 'General Discussion' };
      const created = {
        id: 'cat-new',
        name: 'General Discussion',
        description: null,
        visibility: 'public',
        displayOrder: 0,
        forums: [],
      };
      const serviceMock = { createCategory: jest.fn().mockResolvedValue(created) };
      const controller = new ForumsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.createCategory(dto);

      // Assert
      expect(serviceMock.createCategory).toHaveBeenCalledWith(dto);
      expect(result).toBe(created);
    });
  });

  describe('createForum', () => {
    it('should return the created forum from the service', async () => {
      // Arrange
      const dto = { categoryId: '11111111-1111-4111-8111-111111111111', name: 'News' };
      const created = { id: 'forum-new', ...dto };
      const serviceMock = { createForum: jest.fn().mockResolvedValue(created) };
      const controller = new ForumsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.createForum(dto);

      // Assert
      expect(serviceMock.createForum).toHaveBeenCalledWith(dto);
      expect(result).toBe(created);
    });
  });

  describe('updateForum', () => {
    it('should return the updated forum from the service', async () => {
      // Arrange
      const dto = { name: 'New Name' };
      const updated = { id: 'forum-1', name: 'New Name' };
      const serviceMock = { updateForum: jest.fn().mockResolvedValue(updated) };
      const controller = new ForumsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.updateForum('forum-1', dto);

      // Assert
      expect(serviceMock.updateForum).toHaveBeenCalledWith('forum-1', dto);
      expect(result).toBe(updated);
    });
  });

  describe('changeForumVisibility', () => {
    it('should return the updated forum from the service', async () => {
      // Arrange
      const dto = { visibility: 'registered' as const };
      const updated = { id: 'forum-1', visibility: 'registered' };
      const serviceMock = { changeForumVisibility: jest.fn().mockResolvedValue(updated) };
      const controller = new ForumsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.changeForumVisibility('forum-1', dto);

      // Assert
      expect(serviceMock.changeForumVisibility).toHaveBeenCalledWith('forum-1', dto);
      expect(result).toBe(updated);
    });
  });

  describe('deleteForum', () => {
    it('should delegate deletion to the service and return void', async () => {
      // Arrange
      const serviceMock = { deleteForum: jest.fn().mockResolvedValue(undefined) };
      const controller = new ForumsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.deleteForum('forum-1');

      // Assert
      expect(serviceMock.deleteForum).toHaveBeenCalledWith('forum-1');
      expect(result).toBeUndefined();
    });
  });

  describe('reorderForum', () => {
    it('should return the reordered forum from the service', async () => {
      // Arrange
      const dto = { displayOrder: 0 };
      const updated = { id: 'forum-1', displayOrder: 0 };
      const serviceMock = { reorderForum: jest.fn().mockResolvedValue(updated) };
      const controller = new ForumsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.reorderForum('forum-1', dto);

      // Assert
      expect(serviceMock.reorderForum).toHaveBeenCalledWith('forum-1', dto);
      expect(result).toBe(updated);
    });
  });
});
