import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
}
