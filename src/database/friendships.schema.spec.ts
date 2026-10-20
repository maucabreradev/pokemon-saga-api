import { getTableConfig } from 'drizzle-orm/pg-core';
import { friendships } from './schema/friendships';

// This spec lives outside src/database/schema/ on purpose: drizzle-kit loads every file
// in that folder as a schema module, so a spec with Jest globals there breaks
// `pnpm db:generate` with "describe is not defined".

describe('friendships table', () => {
  it('should forbid a friendship between a character and itself', () => {
    // Arrange
    const config = getTableConfig(friendships);

    // Act
    const checkNames = config.checks.map((check) => check.name);

    // Assert
    expect(checkNames).toContain('friendships_no_self_check');
  });

  it('should keep the unique pair index that prevents duplicated requests', () => {
    // Arrange
    const config = getTableConfig(friendships);

    // Act
    const indexNames = config.indexes.map((index) => index.config.name);

    // Assert
    expect(indexNames).toContain('friendships_pair_idx');
  });
});
