import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListTopicsQueryDto } from './list-topics-query.dto';

describe('ListTopicsQueryDto', () => {
  it('should default to page 1, limit 20, and newest sort', async () => {
    // Arrange
    const dto = plainToInstance(ListTopicsQueryDto, {});

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
    expect(dto.sort).toBe('newest');
  });

  it('should transform numeric strings for page and limit', async () => {
    // Arrange
    const dto = plainToInstance(ListTopicsQueryDto, { page: '2', limit: '10' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(10);
  });

  it('should accept a fully populated valid query', async () => {
    // Arrange
    const dto = plainToInstance(ListTopicsQueryDto, {
      forumId: '11111111-1111-4111-8111-111111111111',
      authorCharacterId: '22222222-2222-4222-8222-222222222222',
      page: '1',
      limit: '50',
      sort: 'replies',
    });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
    expect(dto.limit).toBe(50);
  });

  it('should reject a limit above 50', async () => {
    // Arrange
    const dto = plainToInstance(ListTopicsQueryDto, { limit: '51' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject an unknown sort option', async () => {
    // Arrange
    const dto = plainToInstance(ListTopicsQueryDto, { sort: 'oldest' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a non-UUID forumId', async () => {
    // Arrange
    const dto = plainToInstance(ListTopicsQueryDto, { forumId: 'not-a-uuid' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });
});
