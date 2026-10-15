import { validate } from 'class-validator';
import { RefreshDto } from './refresh.dto';

describe('RefreshDto', () => {
  it('should validate a well-formed refresh token', async () => {
    const dto = new RefreshDto();
    dto.refreshToken = 'w7a8s9d0f1g2h3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject a missing refresh token', async () => {
    const dto = new RefreshDto();

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'refreshToken')).toBe(true);
  });

  it('should reject an empty refresh token', async () => {
    const dto = new RefreshDto();
    dto.refreshToken = '';

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'refreshToken')).toBe(true);
  });
});
