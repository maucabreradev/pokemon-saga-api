import { validate } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

describe('CreateCategoryDto', () => {
  it('should validate a valid name, description, and visibility', async () => {
    const dto = new CreateCategoryDto();
    dto.name = 'General Discussion';
    dto.description = 'Talk about anything';
    dto.visibility = 'public';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should allow description and visibility to be omitted', async () => {
    const dto = new CreateCategoryDto();
    dto.name = 'General Discussion';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject a name shorter than 3 characters', async () => {
    const dto = new CreateCategoryDto();
    dto.name = 'AB';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should reject a name longer than 64 characters', async () => {
    const dto = new CreateCategoryDto();
    dto.name = 'A'.repeat(65);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should reject a description longer than 200 characters', async () => {
    const dto = new CreateCategoryDto();
    dto.name = 'General Discussion';
    dto.description = 'A'.repeat(201);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });

  it('should reject an unknown visibility value', async () => {
    const dto = new CreateCategoryDto();
    dto.name = 'General Discussion';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dto.visibility = 'private' as any;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'visibility')).toBe(true);
  });
});
