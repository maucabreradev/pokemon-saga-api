import { validate } from 'class-validator';
import { ChangePasswordDto } from './change-password.dto';

describe('ChangePasswordDto', () => {
  it('should validate a current and a strong new password', async () => {
    const dto = new ChangePasswordDto();
    dto.currentPassword = 'pikachu-25-forever';
    dto.newPassword = 'charizard-06-forever';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject a new password shorter than 8 characters', async () => {
    const dto = new ChangePasswordDto();
    dto.currentPassword = 'pikachu-25-forever';
    dto.newPassword = 'short';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
  });

  it('should reject a new password longer than 64 characters', async () => {
    const dto = new ChangePasswordDto();
    dto.currentPassword = 'pikachu-25-forever';
    dto.newPassword = 'a'.repeat(65);

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'newPassword')).toBe(true);
  });

  it('should reject an empty current password', async () => {
    const dto = new ChangePasswordDto();
    dto.currentPassword = '';
    dto.newPassword = 'charizard-06-forever';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'currentPassword')).toBe(true);
  });
});
