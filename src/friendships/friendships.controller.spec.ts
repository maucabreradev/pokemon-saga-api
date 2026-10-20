import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { FriendshipsController } from './friendships.controller';

jest.mock('@nestjs/swagger', () => ({
  ApiTags: jest.fn(() => () => undefined),
  ApiOperation: jest.fn(() => () => undefined),
  ApiOkResponse: jest.fn(() => () => undefined),
  ApiBadRequestResponse: jest.fn(() => () => undefined),
  ApiBearerAuth: jest.fn(() => () => undefined),
  ApiUnauthorizedResponse: jest.fn(() => () => undefined),
  ApiForbiddenResponse: jest.fn(() => () => undefined),
  ApiQuery: jest.fn(() => () => undefined),
}));

// database.module pulls @nestjs/config (ESM-only dist) which unit Jest (CJS)
// cannot parse. It is stubbed here; FriendshipsService itself is injected as a manual mock.
jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

describe('FriendshipsController', () => {
  describe('listFriendships', () => {
    it('should delegate the list with the user id and the query', async () => {
      // Arrange
      const query = { page: 1, limit: 20, status: 'accepted' as const };
      const friendships = [
        {
          id: 'friendship-id-1',
          readableId: 'GreenAppleHunter123',
          publicName: 'Pikachu',
          avatarUrl: null,
          friendshipCreatedAt: new Date('2026-10-20T00:00:00.000Z'),
        },
      ];
      const serviceMock = { listFriendships: jest.fn().mockResolvedValue(friendships) };
      const controller = new FriendshipsController(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceMock as any,
      );

      // Act
      const result = await controller.listFriendships('user-id-1', query);

      // Assert
      expect(serviceMock.listFriendships).toHaveBeenCalledWith('user-id-1', query);
      expect(result).toBe(friendships);
    });
  });

  describe('swagger metadata', () => {
    it('should document the status, page and limit query parameters', () => {
      // Arrange: the Swagger CLI plugin is not enabled, so the query DTO is not introspected
      // and every filter has to be declared explicitly to reach the OpenAPI document.
      const declared = (ApiQuery as jest.Mock).mock.calls.map((call) => call[0].name);

      // Act & Assert
      expect(declared).toEqual(expect.arrayContaining(['status', 'page', 'limit']));
    });

    it('should document the status parameter with the known friendship statuses', () => {
      // Arrange
      const statusQuery = (ApiQuery as jest.Mock).mock.calls
        .map((call) => call[0])
        .find((options) => options.name === 'status');

      // Act & Assert
      expect(statusQuery?.enum).toEqual(['pending', 'accepted', 'blocked']);
    });

    it('should document the response envelope that the global interceptor actually returns', () => {
      // Arrange
      const okResponse = (ApiOkResponse as jest.Mock).mock.calls
        .map((call) => call[0])
        .find((options) => options.schema?.example);

      // Act
      const example = okResponse?.schema?.example as { data?: unknown[]; meta?: unknown };

      // Assert
      expect(Array.isArray(example.data)).toBe(true);
      expect(example.meta).toBeDefined();
    });
  });
});
