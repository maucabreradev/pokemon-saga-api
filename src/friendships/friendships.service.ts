import { Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { ForbiddenError } from '../common/exceptions/app-errors';
import { DRIZZLE, DrizzleDB } from '../database/database.module';
import { characters } from '../database/schema/characters';
import { charactersProfile } from '../database/schema/characters-profile';
import { friendships } from '../database/schema/friendships';
import { ListFriendshipsQueryDto } from './dto/list-friendships-query.dto';

export interface FriendshipSummary {
  readableId: string;
  publicName: string;
  avatarUrl: string | null;
  friendshipCreatedAt: Date;
}

@Injectable()
export class FriendshipsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async listFriendships(
    userId: string,
    query: ListFriendshipsQueryDto,
  ): Promise<FriendshipSummary[]> {
    // Main-first character: the main character owns the list, otherwise any active one.
    const [character] = await this.db
      .select({ id: characters.id })
      .from(characters)
      .where(
        and(
          eq(characters.userId, userId),
          eq(characters.status, 'active'),
          isNull(characters.deletedAt),
        ),
      )
      .orderBy(desc(characters.isMainCharacter), asc(characters.createdAt))
      .limit(1);

    if (!character) {
      throw new ForbiddenError('An active character is required to list friendships');
    }

    const status = query.status ?? 'accepted';

    const friendSelection = {
      readableId: characters.readableId,
      publicName: characters.publicName,
      avatarUrl: charactersProfile.avatarUrl,
      friendshipCreatedAt: friendships.createdAt,
    };

    const asRequester = await this.db
      .select(friendSelection)
      .from(friendships)
      .innerJoin(characters, eq(friendships.addresseeCharacterId, characters.id))
      .leftJoin(charactersProfile, eq(charactersProfile.characterId, characters.id))
      .where(
        and(
          eq(friendships.requesterCharacterId, character.id),
          eq(friendships.status, status),
          eq(characters.status, 'active'),
          isNull(characters.deletedAt),
        ),
      )
      .orderBy(desc(friendships.createdAt));

    // A blocked row only belongs in "who I blocked": the addressee direction would
    // expose the characters that blocked the caller, which is not the caller's list.
    const asAddressee =
      status === 'blocked'
        ? []
        : await this.db
            .select(friendSelection)
            .from(friendships)
            .innerJoin(characters, eq(friendships.requesterCharacterId, characters.id))
            .leftJoin(charactersProfile, eq(charactersProfile.characterId, characters.id))
            .where(
              and(
                eq(friendships.addresseeCharacterId, character.id),
                eq(friendships.status, status),
                eq(characters.status, 'active'),
                isNull(characters.deletedAt),
              ),
            )
            .orderBy(desc(friendships.createdAt));

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return [...asRequester, ...asAddressee]
      .sort((a, b) => b.friendshipCreatedAt.getTime() - a.friendshipCreatedAt.getTime())
      .slice((page - 1) * limit, page * limit);
  }
}
