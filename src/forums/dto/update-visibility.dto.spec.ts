import { validate } from 'class-validator';
import { UpdateVisibilityDto } from './update-visibility.dto';

describe('UpdateVisibilityDto', () => {
  it.each(['public', 'registered', 'characters_only'] as const)(
    'should validate visibility %s',
    async (visibility) => {
      const dto = new UpdateVisibilityDto();
      dto.visibility = visibility;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    },
  );

  it('should reject a missing visibility', async () => {
    const errors = await validate(new UpdateVisibilityDto());

    expect(errors.some((e) => e.property === 'visibility')).toBe(true);
  });

  it('should reject an unknown visibility value', async () => {
    const dto = new UpdateVisibilityDto();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dto.visibility = 'private' as any;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'visibility')).toBe(true);
  });
});
