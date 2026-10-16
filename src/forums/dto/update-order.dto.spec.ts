import { validate } from 'class-validator';
import { UpdateOrderDto } from './update-order.dto';

describe('UpdateOrderDto', () => {
  it('should validate a zero position', async () => {
    const dto = new UpdateOrderDto();
    dto.displayOrder = 0;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should validate a positive position', async () => {
    const dto = new UpdateOrderDto();
    dto.displayOrder = 3;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject a missing displayOrder', async () => {
    const errors = await validate(new UpdateOrderDto());

    expect(errors.some((e) => e.property === 'displayOrder')).toBe(true);
  });

  it('should reject a negative displayOrder', async () => {
    const dto = new UpdateOrderDto();
    dto.displayOrder = -1;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'displayOrder')).toBe(true);
  });

  it('should reject a non-integer displayOrder', async () => {
    const dto = new UpdateOrderDto();
    dto.displayOrder = 1.5;

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'displayOrder')).toBe(true);
  });
});
