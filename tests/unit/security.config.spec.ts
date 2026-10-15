import helmet from 'helmet';

describe('Security Configuration', () => {
  let mockApp: Record<string, jest.Mock>;
  let useSpy: jest.Mock;

  beforeEach(() => {
    useSpy = jest.fn();
    mockApp = {
      use: useSpy,
      enableCors: jest.fn(),
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalInterceptors: jest.fn(),
      useGlobalFilters: jest.fn(),
      getHttpAdapter: jest.fn(() => ({
        get: jest.fn(),
      })),
      listen: jest.fn(),
    };
  });

  describe('Helmet configuration', () => {
    it('should call app.use with helmet middleware', () => {
      const { applySecurityConfig } = require('../../src/config/security.config');
      
      applySecurityConfig(mockApp);
      
      expect(useSpy).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should configure helmet with expected security headers', () => {
      const { getHelmetConfig } = require('../../src/config/security.config');
      
      const config = getHelmetConfig();
      
      expect(config).toBeDefined();
      expect(config.contentSecurityPolicy).toBeDefined();
      expect(config.crossOriginEmbedderPolicy).toBe(false);
      expect(config.dnsPrefetchControl).toEqual({ allow: false });
      expect(config.frameguard).toEqual({ action: 'sameorigin' });
      expect(config.hidePoweredBy).toBe(true);
      expect(config.hsts).toEqual({
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      });
      expect(config.noSniff).toBe(true);
      expect(config.referrerPolicy).toEqual({ policy: 'strict-origin-when-cross-origin' });
      expect(config.xssFilter).toBe(true);
    });
  });

  describe('CORS configuration', () => {
    it('should configure CORS with expected options', () => {
      const { applyCorsConfig } = require('../../src/config/security.config');
      
      applyCorsConfig(mockApp);
      
      expect(mockApp.enableCors).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: expect.any(String),
          credentials: true,
        })
      );
    });
  });
});