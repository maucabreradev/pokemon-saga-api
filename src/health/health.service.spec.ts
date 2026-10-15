import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService();
  });

  describe('check', () => {
    it('should return ok status', () => {
      const result = service.check();

      expect(result.status).toBe('ok');
    });

    it('should return a valid ISO timestamp', () => {
      const result = service.check();

      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('should return process uptime in seconds', () => {
      const result = service.check();

      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
