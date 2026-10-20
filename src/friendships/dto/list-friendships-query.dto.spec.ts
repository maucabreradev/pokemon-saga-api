import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListFriendshipsQueryDto } from './list-friendships-query.dto';

describe('ListFriendshipsQueryDto', () => {
  it('should default to page 1, limit 20, and no status filter', async () => {
    // Arrange
    const dto = plainToInstance(ListFriendshipsQueryDto, {});

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
    expect(dto.status).toBeUndefined();
  });

  it('should transform numeric strings for page and limit', async () => {
    // Arrange
    const dto = plainToInstance(ListFriendshipsQueryDto, { page: '2', limit: '10' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(10);
  });

  it('should accept every known friendship status', async () => {
    // Arrange
    const statuses = ['pending', 'accepted', 'blocked'];

    // Act
    const errors = await Promise.all(
      statuses.map(async (status) => {
        const dto = plainToInstance(ListFriendshipsQueryDto, { status });
        return validate(dto);
      }),
    );

    // Assert
    expect(errors.flat()).toHaveLength(0);
  });

  it('should reject an unknown friendship status', async () => {
    // Arrange
    const dto = plainToInstance(ListFriendshipsQueryDto, { status: 'archived' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a limit above the pagination ceiling', async () => {
    // Arrange
    const dto = plainToInstance(ListFriendshipsQueryDto, { limit: '101' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });
});
