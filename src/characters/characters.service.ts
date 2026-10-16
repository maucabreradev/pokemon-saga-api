import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, ne } from 'drizzle-orm';
import { ConflictError, ForbiddenError, NotFoundError } from '../common/exceptions/app-errors';
import { UserRole } from '../auth/decorators/roles.decorator';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { characters } from '../database/schema/characters';
import { charactersProfile } from '../database/schema/characters-profile';
import { users } from '../database/schema/users';
import { generateUniqueReadableId } from '../common/utils/readable-id-generator';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { UpdateReadableIdDto } from './dto/update-readable-id.dto';

export interface CharacterWithProfile {
  id: string;
  readableId: string;
  publicName: string;
  status: 'active' | 'banned' | 'deleted';
  isMainCharacter: boolean;
  bio: string | null;
  createdAt: Date;
}

export interface CharacterPublicProfile {
  readableId: string;
  publicName: string;
  bio: string | null;
  avatarUrl: string | null;
  customTitle: string | null;
  signature: string | null;
  createdAt: Date;
}

@Injectable()
export class CharactersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async getPublicProfile(readableId: string): Promise<CharacterPublicProfile> {
    const [row] = await this.db
      .select({
        readableId: characters.readableId,
        publicName: characters.publicName,
        bio: charactersProfile.bio,
        avatarUrl: charactersProfile.avatarUrl,
        customTitle: charactersProfile.customTitle,
        signature: charactersProfile.signature,
        createdAt: characters.createdAt,
      })
      .from(characters)
      .leftJoin(charactersProfile, eq(charactersProfile.characterId, characters.id))
      .where(
        and(
          eq(characters.readableId, readableId),
          eq(characters.status, 'active'),
          isNull(characters.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      throw new NotFoundError('Character', readableId);
    }

    return row;
  }

  async updateProfile(
    userId: string,
    readableId: string,
    dto: UpdateCharacterDto,
  ): Promise<CharacterPublicProfile> {
    const [character] = await this.db
      .select({
        id: characters.id,
        userId: characters.userId,
        status: characters.status,
      })
      .from(characters)
      .where(
        and(
          eq(characters.readableId, readableId),
          ne(characters.status, 'deleted'),
          isNull(characters.deletedAt),
        ),
      )
      .limit(1);

    if (!character) {
      throw new NotFoundError('Character', readableId);
    }

    if (character.status === 'banned') {
      throw new ForbiddenError('Banned characters cannot be updated');
    }

    if (character.userId !== userId) {
      throw new ForbiddenError('You do not own this character');
    }

    const now = new Date();

    await this.db.transaction(async (tx) => {
      if (dto.publicName !== undefined) {
        await tx
          .update(characters)
          .set({ publicName: dto.publicName, updatedAt: now })
          .where(eq(characters.id, character.id));
      }

      const profileUpdates = {
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        ...(dto.customTitle !== undefined ? { customTitle: dto.customTitle } : {}),
        ...(dto.signature !== undefined ? { signature: dto.signature } : {}),
      };

      if (Object.keys(profileUpdates).length > 0) {
        const updated = await tx
          .update(charactersProfile)
          .set({ ...profileUpdates, updatedAt: now })
          .where(eq(charactersProfile.characterId, character.id))
          .returning({ characterId: charactersProfile.characterId });

        if (updated.length === 0) {
          await tx.insert(charactersProfile).values({
            characterId: character.id,
            ...profileUpdates,
            updatedAt: now,
          });
        }
      }
    });

    const [profile] = await this.db
      .select({
        readableId: characters.readableId,
        publicName: characters.publicName,
        bio: charactersProfile.bio,
        avatarUrl: charactersProfile.avatarUrl,
        customTitle: charactersProfile.customTitle,
        signature: charactersProfile.signature,
        createdAt: characters.createdAt,
      })
      .from(characters)
      .leftJoin(charactersProfile, eq(charactersProfile.characterId, characters.id))
      .where(eq(characters.id, character.id))
      .limit(1);

    return profile;
  }

  async changeReadableId(
    userId: string,
    currentReadableId: string,
    dto: UpdateReadableIdDto,
  ): Promise<CharacterPublicProfile> {
    const [character] = await this.db
      .select({
        id: characters.id,
        userId: characters.userId,
        readableId: characters.readableId,
        readableIdChanged: characters.readableIdChanged,
        status: characters.status,
      })
      .from(characters)
      .where(
        and(
          eq(characters.readableId, currentReadableId),
          ne(characters.status, 'deleted'),
          isNull(characters.deletedAt),
        ),
      )
      .limit(1);

    if (!character) {
      throw new NotFoundError('Character', currentReadableId);
    }

    if (character.status === 'banned') {
      throw new ForbiddenError('Banned characters cannot be renamed');
    }

    if (character.userId !== userId) {
      throw new ForbiddenError('You do not own this character');
    }

    if (character.readableIdChanged) {
      throw new ForbiddenError('Readable ID can only be changed once');
    }

    if (dto.readableId === character.readableId) {
      return this.getPublicProfile(currentReadableId);
    }

    const [taken] = await this.db
      .select({ id: characters.id })
      .from(characters)
      .where(eq(characters.readableId, dto.readableId))
      .limit(1);

    if (taken) {
      throw new ConflictError(`Character with readable ID ${dto.readableId} already exists`);
    }

    const now = new Date();

    await this.db
      .update(characters)
      .set({ readableId: dto.readableId, readableIdChanged: true, updatedAt: now })
      .where(eq(characters.id, character.id));

    const [profile] = await this.db
      .select({
        readableId: characters.readableId,
        publicName: characters.publicName,
        bio: charactersProfile.bio,
        avatarUrl: charactersProfile.avatarUrl,
        customTitle: charactersProfile.customTitle,
        signature: charactersProfile.signature,
        createdAt: characters.createdAt,
      })
      .from(characters)
      .leftJoin(charactersProfile, eq(charactersProfile.characterId, characters.id))
      .where(eq(characters.id, character.id))
      .limit(1);

    return profile;
  }

  async setMainCharacter(userId: string, readableId: string): Promise<CharacterWithProfile> {
    const [character] = await this.db
      .select({
        id: characters.id,
        userId: characters.userId,
        status: characters.status,
        isMainCharacter: characters.isMainCharacter,
      })
      .from(characters)
      .where(
        and(
          eq(characters.readableId, readableId),
          ne(characters.status, 'deleted'),
          isNull(characters.deletedAt),
        ),
      )
      .limit(1);

    if (!character) {
      throw new NotFoundError('Character', readableId);
    }

    if (character.status === 'banned') {
      throw new ForbiddenError('Banned characters cannot be set as main');
    }

    if (character.userId !== userId) {
      throw new ForbiddenError('You do not own this character');
    }

    const now = new Date();

    if (!character.isMainCharacter) {
      await this.db.transaction(async (tx) => {
        await tx
          .update(characters)
          .set({ isMainCharacter: false, updatedAt: now })
          .where(
            and(
              eq(characters.userId, userId),
              ne(characters.status, 'deleted'),
              isNull(characters.deletedAt),
            ),
          );

        await tx
          .update(characters)
          .set({ isMainCharacter: true, updatedAt: now })
          .where(eq(characters.id, character.id));
      });
    }

    const [updated] = await this.db
      .select({
        id: characters.id,
        readableId: characters.readableId,
        publicName: characters.publicName,
        status: characters.status,
        isMainCharacter: characters.isMainCharacter,
        bio: charactersProfile.bio,
        createdAt: characters.createdAt,
      })
      .from(characters)
      .leftJoin(charactersProfile, eq(charactersProfile.characterId, characters.id))
      .where(eq(characters.id, character.id))
      .limit(1);

    return updated;
  }

  async deleteCharacter(userId: string, userRole: UserRole, readableId: string): Promise<void> {
    const [character] = await this.db
      .select({
        id: characters.id,
        userId: characters.userId,
        status: characters.status,
        deletedAt: characters.deletedAt,
      })
      .from(characters)
      .where(eq(characters.readableId, readableId))
      .limit(1);

    if (!character) {
      throw new NotFoundError('Character', readableId);
    }

    if (character.deletedAt !== null || character.status === 'deleted') {
      return;
    }

    const isOwner = character.userId === userId;
    const isStaff = userRole === 'admin' || userRole === 'webmaster';

    if (!isOwner && !isStaff) {
      throw new ForbiddenError('You do not own this character');
    }

    const now = new Date();

    await this.db
      .update(characters)
      .set({ status: 'deleted', deletedAt: now, updatedAt: now })
      .where(eq(characters.id, character.id));
  }

  async create(userId: string, dto: CreateCharacterDto): Promise<CharacterWithProfile> {
    const [user] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const activeCount = await this.db
      .select({ count: characters.id })
      .from(characters)
      .where(
        and(
          eq(characters.userId, userId),
          eq(characters.status, 'active'),
          isNull(characters.deletedAt),
        ),
      );

    if (activeCount.length >= 3) {
      throw new ForbiddenError('Maximum of 3 active characters reached');
    }

    const readableId = await generateUniqueReadableId(async (id) => {
      const existing = await this.db
        .select({ id: characters.id })
        .from(characters)
        .where(eq(characters.readableId, id))
        .limit(1);
      return existing.length > 0;
    });

    const isMainCharacter = activeCount.length === 0;
    const now = new Date();

    return this.db.transaction(async (tx) => {
      const [character] = await tx
        .insert(characters)
        .values({
          userId,
          readableId,
          publicName: dto.publicName,
          status: 'active',
          isMainCharacter,
          createdAt: now,
          updatedAt: now,
        })
        .returning({
          id: characters.id,
          readableId: characters.readableId,
          publicName: characters.publicName,
          status: characters.status,
          isMainCharacter: characters.isMainCharacter,
          createdAt: characters.createdAt,
        });

      await tx.insert(charactersProfile).values({
        characterId: character.id,
        bio: dto.bio ?? null,
        updatedAt: now,
      });

      return {
        ...character,
        bio: dto.bio ?? null,
      };
    });
  }
}
