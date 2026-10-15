import { ThrottlerModuleOptions } from '@nestjs/throttler';

describe('Rate Limiting Configuration', () => {
  describe('getThrottlerConfig', () => {
    it('should return throttler config with global rate limit', () => {
      const { getThrottlerConfig } = require('../../src/config/rate-limit.config');
      
      const config = getThrottlerConfig();
      
      expect(config).toBeDefined();
      expect(config.throttlers).toBeDefined();
      expect(Array.isArray(config.throttlers)).toBe(true);
      expect(config.throttlers.length).toBeGreaterThan(0);
      
      const globalThrottler = config.throttlers[0];
      expect(globalThrottler.name).toBe('global');
      expect(globalThrottler.ttl).toBe(60000); // 1 minute in ms
      expect(globalThrottler.limit).toBe(100); // 100 requests per minute
    });

    it('should include auth-specific throttler with stricter limits', () => {
      const { getThrottlerConfig } = require('../../src/config/rate-limit.config');
      
      const config = getThrottlerConfig();
      
      const authThrottler = config.throttlers.find((t: any) => t.name === 'auth');
      expect(authThrottler).toBeDefined();
      expect(authThrottler.ttl).toBe(60000); // 1 minute in ms
      expect(authThrottler.limit).toBe(5); // 5 requests per minute for auth
    });
  });

  describe('applyRateLimiting', () => {
    it('should return ThrottlerModule configured with throttlers', () => {
      const { applyRateLimiting } = require('../../src/config/rate-limit.config');
      
      const module = applyRateLimiting();
      
      expect(module).toBeDefined();
      expect(module.module).toBeDefined();
    });
  });
});