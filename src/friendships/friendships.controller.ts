import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FRIENDSHIP_STATUSES } from './dto/friendship-status';
import { ListFriendshipsQueryDto } from './dto/list-friendships-query.dto';
import { FriendshipsService } from './friendships.service';

@ApiTags('Friendships')
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List the friendships of the authenticated character' })
  // The Swagger CLI plugin is not enabled, so the query DTO is not introspected and every
  // filter has to be declared explicitly to reach the OpenAPI document.
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [...FRIENDSHIP_STATUSES],
    example: 'accepted',
    description: 'Friendship status to list. Defaults to accepted.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({
    description: 'Friendships retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: '66666666-6666-4666-8666-666666666666',
            readableId: 'GreenAppleHunter123',
            publicName: 'Pikachu',
            avatarUrl: 'https://example.com/avatar.png',
            friendshipCreatedAt: '2026-10-20T00:00:00.000Z',
          },
        ],
        meta: {
          timestamp: '2026-10-20T00:00:00.000Z',
          path: '/api/v1/friendships',
          duration: '3ms',
        },
      },
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
