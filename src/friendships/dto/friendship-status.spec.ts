import { FRIENDSHIP_STATUSES } from './friendship-status';
import { friendshipStatusEnum } from '../../database/schema/friendships';

describe('FRIENDSHIP_STATUSES', () => {
  it('should expose the three known statuses', () => {
    // Act
    const statuses = [...FRIENDSHIP_STATUSES];

    // Assert
    expect(statuses).toEqual(['pending', 'accepted', 'blocked']);
  });

  it('should stay in sync with the database enum', () => {
    // Arrange: the DTO allowlist is hand-written, the enum is the source of truth.
    const enumValues = [...friendshipStatusEnum.enumValues].sort();
    const dtoValues = [...FRIENDSHIP_STATUSES].sort();

    // Act & Assert
    expect(dtoValues).toEqual(enumValues);
  });
});
