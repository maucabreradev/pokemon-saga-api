import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { getThrottlerGlobalGuardProvider } from '../../src/config/rate-limit.config';

@Controller('ping')
class PingController {
  @Get()
  ping() {
    return { pong: true };
  }
}

@Module({
  imports: [ThrottlerModule.forRoot({ throttlers: [{ name: 'default', ttl: 60000, limit: 3 }] })],
  controllers: [PingController],
  providers: [getThrottlerGlobalGuardProvider()],
})
class RateLimitTestModule {}

describe('ThrottlerGuard enforcement', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RateLimitTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should expose rate limit headers within the limit', async () => {
    const response = await request(app.getHttpServer()).get('/ping').expect(200);

    expect(response.headers['x-ratelimit-limit']).toBe('3');
    expect(response.headers['x-ratelimit-remaining']).toBeDefined();
  });

  it('should allow requests within the limit', async () => {
    await request(app.getHttpServer()).get('/ping').expect(200);
    await request(app.getHttpServer()).get('/ping').expect(200);
  });

  it('should reject requests over the limit with 429', async () => {
    const response = await request(app.getHttpServer()).get('/ping').expect(429);

    expect(response.body.statusCode).toBe(429);
  });
});
