process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/pokemon_saga_test';
process.env.JWT_SECRET = 'test-only-secret-key-min-32-chars-long';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-app';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health should return ok status with timestamp and uptime', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(response.body.data.status).toBe('ok');
    expect(new Date(response.body.data.timestamp).toISOString()).toBe(response.body.data.timestamp);
    expect(typeof response.body.data.uptime).toBe('number');
  });
});
