import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateTopicDto } from './update-topic.dto';

describe('UpdateTopicDto', () => {
  it('should accept an empty payload, since PATCH is partial', async () => {
    // Arrange
    const dto = plainToInstance(UpdateTopicDto, {});

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should accept a title-only payload', async () => {
    // Arrange
    const dto = plainToInstance(UpdateTopicDto, { title: 'Renamed topic' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should reject a title shorter than 3 characters', async () => {
    // Arrange
    const dto = plainToInstance(UpdateTopicDto, { title: 'ab' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a title longer than 128 characters', async () => {
    // Arrange
    const dto = plainToInstance(UpdateTopicDto, { title: 'a'.repeat(129) });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject an empty body', async () => {
    // Arrange
    const dto = plainToInstance(UpdateTopicDto, { body: '' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a body longer than 50000 characters', async () => {
    // Arrange
    const dto = plainToInstance(UpdateTopicDto, { body: 'a'.repeat(50001) });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });
});
