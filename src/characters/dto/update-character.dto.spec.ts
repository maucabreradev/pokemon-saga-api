import { validate } from 'class-validator';
import { UpdateCharacterDto } from './update-character.dto';

describe('UpdateCharacterDto', () => {
  it('should validate a fully populated dto', async () => {
    const dto = new UpdateCharacterDto();
    dto.publicName = 'Raichu';
    dto.bio = 'Evolved electric mouse';
    dto.avatarUrl = 'https://example.com/avatar.png';
    dto.customTitle = 'Champion';
    dto.signature = 'Gotta catch em all';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should allow an empty dto for partial updates', async () => {
    const dto = new UpdateCharacterDto();

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject a public name shorter than 3 characters', async () => {
    const dto = new UpdateCharacterDto();
    dto.publicName = 'Pi';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'publicName')).toBe(true);
  });

  it('should reject a public name longer than 32 characters', async () => {
    const dto = new UpdateCharacterDto();
    dto.publicName = 'A'.repeat(33);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'publicName')).toBe(true);
  });

  it('should reject a bio longer than 500 characters', async () => {
    const dto = new UpdateCharacterDto();
    dto.bio = 'A'.repeat(501);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'bio')).toBe(true);
  });

  it('should reject an invalid avatar url', async () => {
    const dto = new UpdateCharacterDto();
    dto.avatarUrl = 'not-a-url';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'avatarUrl')).toBe(true);
  });

  it('should reject a custom title longer than 64 characters', async () => {
    const dto = new UpdateCharacterDto();
    dto.customTitle = 'A'.repeat(65);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'customTitle')).toBe(true);
  });

  it('should reject a signature longer than 200 characters', async () => {
    const dto = new UpdateCharacterDto();
    dto.signature = 'A'.repeat(201);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'signature')).toBe(true);
  });
});
