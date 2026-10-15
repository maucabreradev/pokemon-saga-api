import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';

function createContext(user?: { role: string }) {
  const request: { user?: { role: string } } = {};
  if (user !== undefined) {
    request.user = user;
  }
  const handler = () => undefined;
  const controller = class TestController {};
  return {
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => controller,
    } as unknown as ExecutionContext,
  };
}

describe('RolesGuard', () => {
  const reflectorMock = { getAllAndOverride: jest.fn() };

  function createGuard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new RolesGuard(reflectorMock as any);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow routes without required roles', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(undefined);
    const { context } = createContext({ role: 'user' });

    await expect(createGuard().canActivate(context)).resolves.toBe(true);
  });

  it('should allow users with a required role', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['admin', 'webmaster']);
    const { context } = createContext({ role: 'admin' });

    await expect(createGuard().canActivate(context)).resolves.toBe(true);
  });

  it('should throw ForbiddenException when the role is not required', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['admin']);
    const { context } = createContext({ role: 'user' });

    await expect(createGuard().canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should throw ForbiddenException when no user is attached', async () => {
    reflectorMock.getAllAndOverride.mockReturnValue(['admin']);
    const { context } = createContext();

    await expect(createGuard().canActivate(context)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
