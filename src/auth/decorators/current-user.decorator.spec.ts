import { CurrentUser, JwtPayload, resolveCurrentUser } from './current-user.decorator';

describe('CurrentUser', () => {
  const user: JwtPayload = {
    sub: '11111111-1111-4111-8111-111111111111',
    email: 'ash.ketchum@pallettown.gg',
    role: 'user',
  };

  function createContext(requestUser?: JwtPayload) {
    const request: { user?: JwtPayload } = {};
    if (requestUser !== undefined) {
      request.user = requestUser;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { switchToHttp: () => ({ getRequest: () => request }) } as any;
  }

  it('should be defined as a parameter decorator', () => {
    expect(CurrentUser).toBeDefined();
  });

  it('should resolve the full user when no key is given', () => {
    expect(resolveCurrentUser(undefined, createContext(user))).toEqual(user);
  });

  it('should resolve a single field when a key is given', () => {
    expect(resolveCurrentUser('sub', createContext(user))).toBe(user.sub);
    expect(resolveCurrentUser('email', createContext(user))).toBe(user.email);
  });

  it('should resolve undefined when the guard did not attach a user', () => {
    expect(resolveCurrentUser(undefined, createContext())).toBeUndefined();
  });
});
