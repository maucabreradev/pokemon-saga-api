import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateTopicDto } from './dto/create-topic.dto';
import { ListTopicsQueryDto } from './dto/list-topics-query.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicsService } from './topics.service';

@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List topics with filters and pagination' })
  @ApiOkResponse({
    description: 'Paginated topic list, public forums only for guests',
    schema: {
      example: {
        data: [
          {
            id: '33333333-3333-4333-8333-333333333333',
            title: 'Best starter?',
            forumId: '22222222-2222-4222-8222-222222222222',
            forumName: 'General Discussion',
            authorCharacterId: '44444444-4444-4434-8444-444444444444',
            authorName: 'Ash',
            replyCount: 5,
            viewCount: 10,
            isPinned: false,
            isLocked: false,
            createdAt: '2026-10-15T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Forum not found' })
  @ApiForbiddenResponse({ description: 'No permission to view this forum' })
  async listTopics(@Query() query: ListTopicsQueryDto) {
    return this.topicsService.listTopics(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get topic with paginated posts' })
  @ApiParam({ name: 'id', example: '33333333-3333-4333-8333-333333333333' })
  @ApiOkResponse({
    description: 'Topic detail with chronological posts, public forums only for guests',
    schema: {
      example: {
        topic: {
          id: '33333333-3333-4333-8333-333333333333',
          title: 'Best starter?',
          body: 'Which one do I pick?',
          forumId: '22222222-2222-4222-8222-222222222222',
          forumName: 'General Discussion',
          authorCharacterId: '44444444-4444-4434-8444-444444444444',
          authorName: 'Ash',
          isPinned: false,
          isLocked: false,
          viewCount: 6,
          createdAt: '2026-10-15T00:00:00.000Z',
        },
        posts: {
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  @ApiForbiddenResponse({ description: 'No permission to view this forum' })
  async getTopicDetail(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.topicsService.getTopicDetail(id, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new topic in a forum' })
  @ApiCreatedResponse({
    description: 'Topic created successfully',
    schema: {
      example: {
        id: '33333333-3333-4333-8333-333333333333',
        forumId: '22222222-2222-4222-8222-222222222222',
        authorCharacterId: '44444444-4444-4434-8444-444444444444',
        title: 'Best starter?',
        body: 'Which one do I pick?',
        isPinned: false,
        isLocked: false,
        viewCount: 0,
        replyCount: 0,
        createdAt: '2026-10-16T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Active character required, forum locked or not visible' })
  @ApiNotFoundResponse({ description: 'Forum not found' })
  async createTopic(@Body() dto: CreateTopicDto, @CurrentUser('sub') userId: string) {
    return this.topicsService.createTopic(dto, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a topic (author or staff)' })
  @ApiParam({ name: 'id', example: '33333333-3333-4333-8333-333333333333' })
  @ApiOkResponse({
    description: 'Updated topic',
    schema: {
      example: {
        id: '33333333-3333-4333-8333-333333333333',
        forumId: '22222222-2222-4222-8222-222222222222',
        authorCharacterId: '44444444-4444-4434-8444-444444444444',
        title: 'Best starter?',
        body: 'Which one do I pick?',
        isPinned: false,
        isLocked: false,
        viewCount: 6,
        replyCount: 0,
        createdAt: '2026-10-16T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description: 'Not the author or staff, inactive author character, or topic is locked',
  })
  @ApiNotFoundResponse({ description: 'Topic not found' })
  async updateTopic(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: UpdateTopicDto,
  ) {
    return this.topicsService.updateTopic(id, userId, role, dto);
  }
}
