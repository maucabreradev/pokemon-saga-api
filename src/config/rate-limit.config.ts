import { DynamicModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  Throttle,
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';

// Global bucket: 100 requests per minute per IP, applied to every route
// by ThrottlerGuard once registered as APP_GUARD.
export const DEFAULT_THROTTLE_LIMIT = 100;
export const DEFAULT_THROTTLE_TTL = 60000;

// Strict bucket for auth endpoints (login, register, refresh).
// Applied per-route with @ThrottleAuth() — it must NOT be registered as a
// named throttler in getThrottlerConfig(), because ThrottlerGuard enforces
// every configured named throttler on all routes.
export const AUTH_THROTTLE_LIMIT = 5;
export const AUTH_THROTTLE_TTL = 60000;

export function getThrottlerConfig(): ThrottlerModuleOptions {
  return {
    throttlers: [
      {
        name: 'default',
        ttl: DEFAULT_THROTTLE_TTL,
        limit: DEFAULT_THROTTLE_LIMIT,
      },
    ],
  };
}

export function getThrottlerGlobalGuardProvider() {
  return {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  };
}

export function applyRateLimiting(): DynamicModule {
  return ThrottlerModule.forRoot(getThrottlerConfig());
}

export function ThrottleAuth() {
  return Throttle({
    default: {
      limit: AUTH_THROTTLE_LIMIT,
      ttl: AUTH_THROTTLE_TTL,
    },
  });
}

// 3 requests per hour per IP for character creation
export const CHARACTER_CREATION_THROTTLE_LIMIT = 3;
export const CHARACTER_CREATION_THROTTLE_TTL = 3600000;

export function ThrottleCharacterCreation() {
  return Throttle({
    default: {
      limit: CHARACTER_CREATION_THROTTLE_LIMIT,
      ttl: CHARACTER_CREATION_THROTTLE_TTL,
    },
  });
}
