import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { THROTTLER_LIMIT, THROTTLER_TTL } from '@nestjs/throttler/dist/throttler.constants';
import {
  AUTH_THROTTLE_LIMIT,
  AUTH_THROTTLE_TTL,
  ThrottleAuth,
  applyRateLimiting,
  getThrottlerConfig,
  getThrottlerGlobalGuardProvider,
} from './rate-limit.config';

describe('Rate Limiting Configuration', () => {
  describe('getThrottlerConfig', () => {
    it('should define a default throttler with 100 requests per minute', () => {
      const config = getThrottlerConfig();

      if (Array.isArray(config)) {
        throw new Error('Expected object throttler options');
      }

      expect(config.throttlers).toEqual([{ name: 'default', ttl: 60000, limit: 100 }]);
    });
  });

  describe('getThrottlerGlobalGuardProvider', () => {
    it('should register ThrottlerGuard as a global guard', () => {
      expect(getThrottlerGlobalGuardProvider()).toEqual({
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      });
    });
  });

  describe('applyRateLimiting', () => {
    it('should return the configured ThrottlerModule', () => {
      const module = applyRateLimiting();

      expect(module).toBeDefined();
      expect(module.module).toBeDefined();
    });
  });

  describe('ThrottleAuth', () => {
    it('should set a strict per-minute limit on the default throttler', () => {
      class AuthController {
        @ThrottleAuth()
        login() {
          return 'tokens';
        }
      }

      const handler = AuthController.prototype.login;

      expect(Reflect.getMetadata(THROTTLER_LIMIT + 'default', handler)).toBe(AUTH_THROTTLE_LIMIT);
      expect(Reflect.getMetadata(THROTTLER_TTL + 'default', handler)).toBe(AUTH_THROTTLE_TTL);
      expect(AUTH_THROTTLE_LIMIT).toBe(5);
      expect(AUTH_THROTTLE_TTL).toBe(60000);
    });
  });
});
