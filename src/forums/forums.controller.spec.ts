import { ForumsController } from './forums.controller';

jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiNotFoundResponse: () => () => undefined,
  ApiParam: () => () => undefined,
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
});
