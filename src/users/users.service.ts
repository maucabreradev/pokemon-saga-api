import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ConflictError, NotFoundError } from '../common/exceptions/app-errors';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { users } from '../database/schema/users';

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'webmaster';
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getMe(userId: string): Promise<UserProfile> {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user;
  }

  async updateEmail(userId: string, email: string): Promise<UserProfile> {
    const [current] = await this.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!current) {
      throw new NotFoundError('User', userId);
    }

    if (current.email === email) {
      return current;
    }

    const [taken] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (taken) {
      throw new ConflictError(`User with email ${email} already exists`);
    }

    const [updated] = await this.db
      .update(users)
      .set({ email, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    return updated;
  }
}
