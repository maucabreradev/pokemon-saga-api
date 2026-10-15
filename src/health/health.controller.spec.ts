import { HealthController } from './health.controller';
import { HealthService } from './health.service';

// @nestjs/swagger ships ESM-only dist that Jest (CJS) cannot parse.
// The Swagger decorators carry no runtime behavior relevant to this test,
// so they are stubbed out with no-op decorator factories.
jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => undefined,
  ApiOperation: () => () => undefined,
  ApiResponse: () => () => undefined,
}));

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(() => {
    service = new HealthService();
    controller = new HealthController(service);
  });

  describe('check', () => {
    it('should return the health status from the service', () => {
      const expected = {
        status: 'ok',
        timestamp: '2026-10-14T12:00:00.000Z',
        uptime: 123.45,
      };
      jest.spyOn(service, 'check').mockReturnValue(expected);

      expect(controller.check()).toEqual(expected);
    });
  });
});
