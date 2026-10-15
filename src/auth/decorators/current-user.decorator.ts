import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin' | 'webmaster';
}

export function resolveCurrentUser(data: keyof JwtPayload | undefined, ctx: ExecutionContext) {
  const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();

  if (data === undefined) {
    return request.user;
  }

  return request.user?.[data];
}

export const CurrentUser = createParamDecorator<keyof JwtPayload | undefined>(resolveCurrentUser);
