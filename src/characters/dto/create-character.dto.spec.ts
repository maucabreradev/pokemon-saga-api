import { validate } from 'class-validator';
import { CreateCharacterDto } from './create-character.dto';

describe('CreateCharacterDto', () => {
  it('should validate a valid public name and bio', async () => {
    const dto = new CreateCharacterDto();
    dto.publicName = 'Pikachu';
    dto.bio = 'Electric mouse Pokemon';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject a public name shorter than 3 characters', async () => {
    const dto = new CreateCharacterDto();
    dto.publicName = 'Pi';

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'publicName')).toBe(true);
  });

  it('should reject a public name longer than 32 characters', async () => {
    const dto = new CreateCharacterDto();
    dto.publicName = 'A'.repeat(33);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'publicName')).toBe(true);
  });

  it('should reject a bio longer than 500 characters', async () => {
    const dto = new CreateCharacterDto();
    dto.publicName = 'Pikachu';
    dto.bio = 'A'.repeat(501);

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'bio')).toBe(true);
  });

  it('should allow optional bio to be omitted', async () => {
    const dto = new CreateCharacterDto();
    dto.publicName = 'Pikachu';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
