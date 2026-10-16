import { validate } from 'class-validator';
import { UpdateReadableIdDto } from './update-readable-id.dto';

describe('UpdateReadableIdDto', () => {
  it('should validate a well-formed readable id', async () => {
    const dto = new UpdateReadableIdDto();
    dto.readableId = 'BlueOceanRunner456';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject a missing readable id', async () => {
    const dto = new UpdateReadableIdDto();

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'readableId')).toBe(true);
  });

  it('should reject a non-string readable id', async () => {
    const dto = new UpdateReadableIdDto();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dto.readableId = 123 as any;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'readableId')).toBe(true);
  });

  it.each(['1StartsWithDigit', 'ab', 'A'.repeat(33), 'has-dash', 'with space', ''])(
    'should reject invalid readable id %p',
    async (readableId: string) => {
      const dto = new UpdateReadableIdDto();
      dto.readableId = readableId;

      const errors = await validate(dto);

      expect(errors.some((e) => e.property === 'readableId')).toBe(true);
    },
  );
});
