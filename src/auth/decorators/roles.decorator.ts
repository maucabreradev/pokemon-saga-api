import { SetMetadata } from '@nestjs/common';

export type UserRole = 'user' | 'admin' | 'webmaster';

export const ROLES_KEY = 'roles';

export function Roles(...roles: UserRole[]) {
  return SetMetadata(ROLES_KEY, roles);
}
