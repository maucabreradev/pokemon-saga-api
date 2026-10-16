import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { ForbiddenError, NotFoundError } from '../common/exceptions/app-errors';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { characters } from '../database/schema/characters';
import { charactersProfile } from '../database/schema/characters-profile';
import { users } from '../database/schema/users';
import { generateUniqueReadableId } from '../common/utils/readable-id-generator';
import { CreateCharacterDto } from './dto/create-character.dto';

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
