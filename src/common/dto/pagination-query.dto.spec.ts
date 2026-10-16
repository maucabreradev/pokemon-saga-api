import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

describe('PaginationQueryDto', () => {
  it('should default to page 1 and limit 20', async () => {
    const dto: PaginationQueryDto = plainToInstance(PaginationQueryDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });

  it('should convert numeric query strings', async () => {
    const dto: PaginationQueryDto = plainToInstance(PaginationQueryDto, { page: '2', limit: '10' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(10);
  });

  it.each([{ page: 0 }, { limit: 0 }, { limit: 101 }, { page: 'abc' }])(
    'should reject invalid pagination %p',
    async (query: object) => {
      const dto: PaginationQueryDto = plainToInstance(PaginationQueryDto, query);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    },
  );
});
