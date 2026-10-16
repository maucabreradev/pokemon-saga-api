import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
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
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ForumsService } from './forums.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';

@ApiTags('Forums')
@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get full category/forum tree' })
  @ApiOkResponse({
    description: 'Nested category/forum tree, public entries only for guests',
    schema: {
      example: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          name: 'General',
          description: 'General discussion',
          visibility: 'public',
          displayOrder: 0,
          forums: [
            {
              id: '22222222-2222-4222-8222-222222222222',
              name: 'Announcements',
              description: null,
              visibility: 'public',
              displayOrder: 0,
              forums: [],
            },
          ],
        },
      ],
    },
  })
  async getTree() {
    return this.forumsService.getTree();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get forum details with sub-forums' })
  @ApiParam({ name: 'id', example: '22222222-2222-4222-8222-222222222222' })
  @ApiOkResponse({
    description: 'Forum details with immediate sub-forums, breadcrumb, and topic count',
    schema: {
      example: {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Announcements',
        description: null,
        visibility: 'public',
        displayOrder: 0,
        subForums: [],
        breadcrumb: [{ id: '11111111-1111-4111-8111-111111111111', name: 'General' }],
        topicCount: 5,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Forum not found' })
  async getForumDetail(@Param('id') id: string) {
    return this.forumsService.getForumDetail(id);
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'webmaster')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new forum category' })
  @ApiCreatedResponse({
    description: 'Category created successfully',
    schema: {
      example: {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'General Discussion',
        description: 'Talk about anything',
        visibility: 'public',
        displayOrder: 0,
        forums: [],
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin or webmaster role required' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.forumsService.createCategory(dto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin', 'webmaster')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new forum (optionally nested)' })
  @ApiCreatedResponse({
    description: 'Forum created successfully',
    schema: {
      example: {
        id: '22222222-2222-4222-8222-222222222222',
        categoryId: '11111111-1111-4111-8111-111111111111',
        parentForumId: null,
        name: 'Announcements',
        description: null,
        visibility: 'public',
        displayOrder: 0,
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin or webmaster role required' })
  @ApiNotFoundResponse({ description: 'Category or parent forum not found' })
  async createForum(@Body() dto: CreateForumDto) {
    return this.forumsService.createForum(dto);
  }

  @Patch(':id')
  @Roles('admin', 'webmaster')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update forum details' })
  @ApiParam({ name: 'id', example: '22222222-2222-4222-8222-222222222222' })
  @ApiOkResponse({
    description: 'Updated forum',
    schema: {
      example: {
        id: '22222222-2222-4222-8222-222222222222',
        categoryId: '11111111-1111-4111-8111-111111111111',
        parentForumId: null,
        name: 'Announcements',
        description: 'Official news',
        visibility: 'public',
        displayOrder: 0,
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Admin or webmaster role required' })
  @ApiNotFoundResponse({ description: 'Forum not found' })
  async updateForum(@Param('id') id: string, @Body() dto: UpdateForumDto) {
    return this.forumsService.updateForum(id, dto);
  }
}
