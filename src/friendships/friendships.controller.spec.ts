import { FriendshipsController } from './friendships.controller';

jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiBadRequestResponse: () => () => undefined,
  ApiBearerAuth: () => () => undefined,
  ApiUnauthorizedResponse: () => () => undefined,
  ApiForbiddenResponse: () => () => undefined,
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
});
