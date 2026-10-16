import { validate } from 'class-validator';
import { UpdateForumDto } from './update-forum.dto';

describe('UpdateForumDto', () => {
  it('should validate an empty dto (no-op update)', async () => {
    const errors = await validate(new UpdateForumDto());

    expect(errors).toHaveLength(0);
  });

  it('should validate a partial name update', async () => {
    const dto = new UpdateForumDto();
    dto.name = 'New Name';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate a partial description update', async () => {
    const dto = new UpdateForumDto();
    dto.description = 'New description';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject a name shorter than 3 characters', async () => {
    const dto = new UpdateForumDto();
    dto.name = 'AB';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should reject a name longer than 64 characters', async () => {
    const dto = new UpdateForumDto();
    dto.name = 'A'.repeat(65);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('should reject a description longer than 200 characters', async () => {
    const dto = new UpdateForumDto();
    dto.description = 'A'.repeat(201);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });
});
