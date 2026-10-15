import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

// @nestjs/jwt ships ESM-only dist that Jest (CJS) cannot parse.
// JwtService is injected as a manual mock, so the module is stubbed.
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

function createContext(authorization?: string) {
  const request: { headers: Record<string, string | undefined>; user?: unknown } = { headers: {} };
  if (authorization !== undefined) {
    request.headers.authorization = authorization;
  }
  const handler = () => undefined;
  const controller = class TestController {};
  return {
    request,

    context: {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => controller,
    } as unknown as ExecutionContext,
  };
}

describe('AuthGuard', () => {
  const reflectorMock = { getAllAndOverride: jest.fn() };
  const jwtMock = { verifyAsync: jest.fn() };

  function createGuard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new AuthGuard(jwtMock as any, reflectorMock as any);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow public routes without a token', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);
    const { context } = createContext();

    await expect(createGuard().canActivate(context)).resolves.toBe(true);
    expect(jwtMock.verifyAsync).not.toHaveBeenCalled();
  });

  it('should attach the payload and allow valid tokens', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 'user-id', email: 'ash.ketchum@pallettown.gg', role: 'user' };
    jwtMock.verifyAsync.mockResolvedValue(payload);
    const { context, request } = createContext('Bearer valid-token');

    await expect(createGuard().canActivate(context)).resolves.toBe(true);
    expect(jwtMock.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(payload);
  });

  it('should throw UnauthorizedException when no authorization header is present', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    const { context } = createContext();

    await expect(createGuard().canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException when the scheme is not Bearer', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    const { context } = createContext('Basic dXNlcjpwYXNzd29yZA==');

    await expect(createGuard().canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException when verification fails', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(false);
    jwtMock.verifyAsync.mockRejectedValue(new Error('invalid signature'));
    const { context } = createContext('Bearer forged-token');

    await expect(createGuard().canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
