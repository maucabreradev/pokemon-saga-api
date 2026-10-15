import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should validate a well-formed email and password', async () => {
    const dto = new RegisterDto();
    dto.email = 'ash.ketchum@pallettown.gg';
    dto.password = 'pikachu-25-forever';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid email', async () => {
    const dto = new RegisterDto();
    dto.email = 'not-an-email';
    dto.password = 'pikachu-25-forever';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });

  it('should reject a password shorter than 8 characters', async () => {
    const dto = new RegisterDto();
    dto.email = 'ash.ketchum@pallettown.gg';
    dto.password = 'short';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'password')).toBe(true);
  });
});
