import { TopicsController } from './topics.controller';

jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiNotFoundResponse: () => () => undefined,
  ApiForbiddenResponse: () => () => undefined,
  ApiNoContentResponse: () => () => undefined,
  ApiParam: () => () => undefined,
  ApiQuery: () => () => undefined,
  ApiCreatedResponse: () => () => undefined,
  ApiBadRequestResponse: () => () => undefined,
  ApiBearerAuth: () => () => undefined,
  ApiUnauthorizedResponse: () => () => undefined,
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

  describe('getTopicDetail', () => {
    it('should return the topic detail from the service', async () => {
      // Arrange
      const id = 'topic-id-1';
      const query = { page: 1, limit: 20 };
      const detail = {
        topic: { id },
        posts: { data: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      };
      const serviceMock = {
        listTopics: jest.fn(),
        getTopicDetail: jest.fn().mockResolvedValue(detail),
      };
      const controller = new TopicsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.getTopicDetail(id, query);

      // Assert
      expect(serviceMock.getTopicDetail).toHaveBeenCalledWith(id, query);
      expect(result).toBe(detail);
    });
  });

  describe('createTopic', () => {
    it('should delegate creation with dto and userId', async () => {
      // Arrange
      const dto = { forumId: 'forum-id-1', title: 'Best starter?', body: 'Which one?' };
      const userId = 'user-id-1';
      const created = { id: 'topic-id-1', ...dto };
      const serviceMock = {
        listTopics: jest.fn(),
        getTopicDetail: jest.fn(),
        createTopic: jest.fn().mockResolvedValue(created),
      };
      const controller = new TopicsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.createTopic(dto, userId);

      // Assert
      expect(serviceMock.createTopic).toHaveBeenCalledWith(dto, userId);
      expect(result).toBe(created);
    });
  });

  describe('updateTopic', () => {
    it('should delegate the edit with the topic id, user, role and dto', async () => {
      // Arrange
      const dto = { title: 'Updated title' };
      const updated = { id: 'topic-id-1', title: 'Updated title' };
      const serviceMock = { updateTopic: jest.fn().mockResolvedValue(updated) };
      const controller = new TopicsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.updateTopic('topic-id-1', 'user-id-1', 'admin', dto);

      // Assert
      expect(serviceMock.updateTopic).toHaveBeenCalledWith('topic-id-1', 'user-id-1', 'admin', dto);
      expect(result).toBe(updated);
    });
  });

  describe('deleteTopic', () => {
    it('should delegate the delete with the topic id, user and role', async () => {
      // Arrange
      const serviceMock = { deleteTopic: jest.fn().mockResolvedValue(undefined) };
      const controller = new TopicsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.deleteTopic('topic-id-1', 'user-id-1', 'admin');

      // Assert
      expect(serviceMock.deleteTopic).toHaveBeenCalledWith('topic-id-1', 'user-id-1', 'admin');
      expect(result).toBeUndefined();
    });
  });

  describe('pinTopic', () => {
    it('should delegate the pin with the topic id', async () => {
      // Arrange
      const updated = { id: 'topic-id-1', isPinned: true };
      const serviceMock = { pinTopic: jest.fn().mockResolvedValue(updated) };
      const controller = new TopicsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.pinTopic('topic-id-1');

      // Assert
      expect(serviceMock.pinTopic).toHaveBeenCalledWith('topic-id-1');
      expect(result).toBe(updated);
    });
  });

  describe('lockTopic', () => {
    it('should delegate the lock with the topic id', async () => {
      // Arrange
      const updated = { id: 'topic-id-1', isLocked: true };
      const serviceMock = { lockTopic: jest.fn().mockResolvedValue(updated) };
      const controller = new TopicsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.lockTopic('topic-id-1');

      // Assert
      expect(serviceMock.lockTopic).toHaveBeenCalledWith('topic-id-1');
      expect(result).toBe(updated);
    });
  });
});
