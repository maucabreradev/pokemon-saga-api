import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

const validPayload = {
  topicId: '33333333-3333-4333-8333-333333333333',
  body: 'I pick Bulbasaur.',
};

describe('CreatePostDto', () => {
  it('should accept a valid payload', async () => {
    // Arrange
    const dto = plainToInstance(CreatePostDto, validPayload);

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should accept a parentPostId for nested replies', async () => {
    // Arrange
    const dto = plainToInstance(CreatePostDto, {
      ...validPayload,
      parentPostId: '55555555-5555-4555-8555-555555555555',
    });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should reject an empty body', async () => {
    // Arrange
    const dto = plainToInstance(CreatePostDto, { ...validPayload, body: '' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a body longer than 10000 characters', async () => {
    // Arrange
    const dto = plainToInstance(CreatePostDto, { ...validPayload, body: 'a'.repeat(10001) });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a non-UUID topicId', async () => {
    // Arrange
    const dto = plainToInstance(CreatePostDto, { ...validPayload, topicId: 'not-a-uuid' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a non-UUID parentPostId', async () => {
    // Arrange
    const dto = plainToInstance(CreatePostDto, { ...validPayload, parentPostId: 'not-a-uuid' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });
});
