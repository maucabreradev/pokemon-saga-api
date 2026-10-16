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
});
