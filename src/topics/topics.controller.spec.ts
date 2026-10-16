import { TopicsController } from './topics.controller';

jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiNotFoundResponse: () => () => undefined,
  ApiForbiddenResponse: () => () => undefined,
  ApiQuery: () => () => undefined,
}));

jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

describe('TopicsController', () => {
  describe('listTopics', () => {
    it('should return the paginated topic list from the service', async () => {
      // Arrange
      const query = { page: 1, limit: 20 };
      const page = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      const serviceMock = { listTopics: jest.fn().mockResolvedValue(page) };
      const controller = new TopicsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.listTopics(query);

      // Assert
      expect(serviceMock.listTopics).toHaveBeenCalledWith(query);
      expect(result).toBe(page);
    });
  });
});
