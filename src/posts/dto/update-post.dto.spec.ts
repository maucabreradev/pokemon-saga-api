import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePostDto } from './update-post.dto';

describe('UpdatePostDto', () => {
  it('should accept an empty payload, since PATCH is partial', async () => {
    // Arrange
    const dto = plainToInstance(UpdatePostDto, {});

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should accept a body-only payload', async () => {
    // Arrange
    const dto = plainToInstance(UpdatePostDto, { body: 'Updated reply.' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should reject an empty body', async () => {
    // Arrange
    const dto = plainToInstance(UpdatePostDto, { body: '' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a body longer than 10000 characters', async () => {
    // Arrange
    const dto = plainToInstance(UpdatePostDto, { body: 'a'.repeat(10001) });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });
});
