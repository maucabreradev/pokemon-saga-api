import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTopicDto } from './create-topic.dto';

const validQuery = {
  forumId: '11111111-1111-4111-8111-111111111111',
  title: 'Best starter?',
  body: 'Which one do I pick?',
};

describe('CreateTopicDto', () => {
  it('should accept a valid payload', async () => {
    // Arrange
    const dto = plainToInstance(CreateTopicDto, validQuery);

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should reject a title shorter than 3 characters', async () => {
    // Arrange
    const dto = plainToInstance(CreateTopicDto, { ...validQuery, title: 'ab' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a title longer than 128 characters', async () => {
    // Arrange
    const dto = plainToInstance(CreateTopicDto, { ...validQuery, title: 'a'.repeat(129) });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject an empty body', async () => {
    // Arrange
    const dto = plainToInstance(CreateTopicDto, { ...validQuery, body: '' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a body longer than 50000 characters', async () => {
    // Arrange
    const dto = plainToInstance(CreateTopicDto, { ...validQuery, body: 'a'.repeat(50001) });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a non-UUID forumId', async () => {
    // Arrange
    const dto = plainToInstance(CreateTopicDto, { ...validQuery, forumId: 'not-a-uuid' });

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });
});
