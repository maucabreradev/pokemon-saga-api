import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto', () => {
  it('should validate a well-formed email', async () => {
    const dto = new UpdateUserDto();
    dto.email = 'misty.cerulean@pallettown.gg';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid email', async () => {
    const dto = new UpdateUserDto();
    dto.email = 'not-an-email';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });
});
