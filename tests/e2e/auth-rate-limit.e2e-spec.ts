process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/pokemon_saga_test';
process.env.JWT_SECRET = 'test-only-secret-key-min-32-chars-long';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-app';

describe('Auth rate limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/register should return 429 after 5 requests per minute', async () => {
    const statuses: number[] = [];

    for (let i = 0; i < 6; i++) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'ash.ketchum@pallettown.gg', password: 'pikachu-25-forever' });
      statuses.push(response.status);
    }

    expect(statuses.slice(0, 5).every((status) => status !== 429)).toBe(true);
    expect(statuses[5]).toBe(429);
  });

  it('GET /api/v1/health should not be throttled by the auth bucket', async () => {
    const statuses: number[] = [];

    for (let i = 0; i < 6; i++) {
      const response = await request(app.getHttpServer()).get('/api/v1/health');
      statuses.push(response.status);
    }

    expect(statuses.every((status) => status === 200)).toBe(true);
  });
});
