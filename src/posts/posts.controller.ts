import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
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
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a single post' })
  @ApiParam({ name: 'id', example: '55555555-5555-4555-8555-555555555555' })
  @ApiOkResponse({
    description: 'Post detail, public forums only for guests',
    schema: {
      example: {
        id: '55555555-5555-4555-8555-555555555555',
        topicId: '33333333-3333-4333-8333-333333333333',
        parentPostId: null,
        authorCharacterId: '44444444-4444-4434-8444-444444444444',
        authorName: 'Ash',
        body: 'I pick Bulbasaur.',
        replyCount: 2,
        createdAt: '2026-10-17T00:00:00.000Z',
        updatedAt: '2026-10-17T00:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiForbiddenResponse({ description: 'No permission to view this post' })
  async getPostDetail(@Param('id') id: string) {
    return this.postsService.getPostDetail(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post in a topic' })
  @ApiCreatedResponse({
    description: 'Post created successfully',
    schema: {
      example: {
        id: '55555555-5555-4555-8555-555555555555',
        topicId: '33333333-3333-4333-8333-333333333333',
        parentPostId: null,
        authorCharacterId: '44444444-4444-4434-8444-444444444444',
        body: 'I pick Bulbasaur.',
        createdAt: '2026-10-17T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({
    description: 'Active character required, topic locked, or forum not visible',
  })
  @ApiNotFoundResponse({ description: 'Topic or parent post not found' })
  async createPost(@Body() dto: CreatePostDto, @CurrentUser('sub') userId: string) {
    return this.postsService.createPost(dto, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a post (author or staff)' })
  @ApiParam({ name: 'id', example: '55555555-5555-4555-8555-555555555555' })
  @ApiOkResponse({
    description: 'Updated post',
    schema: {
      example: {
        id: '55555555-5555-4555-8555-555555555555',
        topicId: '33333333-3333-4333-8333-333333333333',
        parentPostId: null,
        authorCharacterId: '44444444-4444-4434-8444-444444444444',
        body: 'I pick Squirtle.',
        createdAt: '2026-10-17T00:00:00.000Z',
        updatedAt: '2026-10-17T01:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Not the author or staff, or inactive author character' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  async updatePost(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, userId, role, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a post (author or staff)' })
  @ApiParam({ name: 'id', example: '55555555-5555-4555-8555-555555555555' })
  @ApiNoContentResponse({ description: 'Post soft deleted' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Not the author or staff, or inactive author character' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  async deletePost(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    await this.postsService.deletePost(id, userId, role);
  }
}
