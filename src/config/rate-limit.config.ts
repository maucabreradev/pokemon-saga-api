import { ThrottlerModuleOptions, ThrottlerModule } from '@nestjs/throttler';
import { DynamicModule } from '@nestjs/common';

export function getThrottlerConfig(): ThrottlerModuleOptions {
  return {
    throttlers: [
      {
        name: 'global',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'auth',
        ttl: 60000, // 1 minute
        limit: 5, // 5 requests per minute
      },
    ],
  };
}

export function applyRateLimiting(): DynamicModule {
  const config = getThrottlerConfig();
  return ThrottlerModule.forRoot(config);
}