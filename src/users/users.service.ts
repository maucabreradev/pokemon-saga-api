import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { and, asc, desc, eq, gt, isNull, ne } from 'drizzle-orm';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../common/exceptions/app-errors';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { characters } from '../database/schema/characters';
import { refreshTokens } from '../database/schema/refresh-tokens';
import { users } from '../database/schema/users';

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'webmaster';
  createdAt: Date;
}

export interface CharacterSummary {
  id: string;
  readableId: string;
  publicName: string;
  status: 'active' | 'banned' | 'deleted';
  isMainCharacter: boolean;
}

export interface SessionSummary {
  id: string;
  createdAt: Date;
  expiresAt: Date;
}

const BCRYPT_SALT_ROUNDS = 12;

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
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
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
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const [user] = await this.db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const currentMatches = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!currentMatches) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const samePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (samePassword) {
      throw new ValidationError('New password must be different from the current password');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));

    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.userId, userId));
  }

  async getMyCharacters(userId: string): Promise<CharacterSummary[]> {
    return this.db
      .select({
        id: characters.id,
        readableId: characters.readableId,
        publicName: characters.publicName,
        status: characters.status,
        isMainCharacter: characters.isMainCharacter,
      })
      .from(characters)
      .where(
        and(
          eq(characters.userId, userId),
          ne(characters.status, 'deleted'),
          isNull(characters.deletedAt),
        ),
      )
      .orderBy(asc(characters.createdAt));
  }

  async getMySessions(userId: string): Promise<SessionSummary[]> {
    return this.db
      .select({
        id: refreshTokens.id,
        createdAt: refreshTokens.createdAt,
        expiresAt: refreshTokens.expiresAt,
      })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(refreshTokens.createdAt));
  }

  async deleteMe(userId: string): Promise<void> {
    const [user] = await this.db
      .select({ id: users.id, deletedAt: users.deletedAt })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    if (user.deletedAt) {
      return;
    }

    const now = new Date();

    await this.db.transaction(async (tx) => {
      await tx.update(users).set({ deletedAt: now, updatedAt: now }).where(eq(users.id, userId));

      await tx
        .update(refreshTokens)
        .set({ revokedAt: now })
        .where(eq(refreshTokens.userId, userId));

      await tx
        .update(characters)
        .set({ status: 'deleted', deletedAt: now, updatedAt: now })
        .where(
          and(
            eq(characters.userId, userId),
            ne(characters.status, 'deleted'),
            isNull(characters.deletedAt),
          ),
        );
    });
  }
}
