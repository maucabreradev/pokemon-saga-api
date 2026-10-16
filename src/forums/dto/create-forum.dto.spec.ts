import { validate } from 'class-validator';
import { CreateForumDto } from './create-forum.dto';

describe('CreateForumDto', () => {
  function validDto(): CreateForumDto {
    const dto = new CreateForumDto();
    dto.categoryId = '11111111-1111-4111-8111-111111111111';
    dto.name = 'Announcements';
    return dto;
  }

  it('should validate a minimal top-level forum', async () => {
    const errors = await validate(validDto());

    expect(errors).toHaveLength(0);
  });

  it('should validate a nested forum with all fields', async () => {
    const dto = validDto();
    dto.parentForumId = '22222222-2222-4222-8222-222222222222';
    dto.description = 'Official news';
    dto.visibility = 'registered';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject a non-UUID categoryId', async () => {
    const dto = validDto();
    dto.categoryId = 'not-a-uuid';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'categoryId')).toBe(true);
  });

  it('should reject a non-UUID parentForumId', async () => {
    const dto = validDto();
    dto.parentForumId = 'not-a-uuid';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'parentForumId')).toBe(true);
  });

  it('should reject a name shorter than 3 characters', async () => {
    const dto = validDto();
    dto.name = 'AB';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should reject an unknown visibility value', async () => {
    const dto = validDto();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dto.visibility = 'private' as any;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'visibility')).toBe(true);
  });
});
