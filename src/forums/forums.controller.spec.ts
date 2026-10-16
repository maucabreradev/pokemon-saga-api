import { ForumsController } from './forums.controller';

jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiOkResponse: () => () => undefined,
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
});
