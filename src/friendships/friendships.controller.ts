import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ListFriendshipsQueryDto } from './dto/list-friendships-query.dto';
import { FriendshipsService } from './friendships.service';

@ApiTags('Friendships')
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the friendships of the authenticated character' })
  @ApiOkResponse({
    description: 'Friendships retrieved successfully',
    schema: {
      example: [
        {
          readableId: 'GreenAppleHunter123',
          publicName: 'Pikachu',
          avatarUrl: 'https://example.com/avatar.png',
          friendshipCreatedAt: '2026-10-20T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'An active character is required' })
  async listFriendships(
    @CurrentUser('sub') userId: string,
    @Query() query: ListFriendshipsQueryDto,
  ) {
    return this.friendshipsService.listFriendships(userId, query);
  }
}
