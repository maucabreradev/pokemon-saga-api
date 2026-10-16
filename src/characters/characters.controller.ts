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
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { UpdateReadableIdDto } from './dto/update-readable-id.dto';
import { CharactersService } from './characters.service';
import { ThrottleCharacterCreation } from '../config/rate-limit.config';

@ApiTags('Characters')
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ThrottleCharacterCreation()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new character' })
  @ApiCreatedResponse({
    description: 'Character created successfully',
    schema: {
      example: {
        id: '22222222-2222-4222-8222-222222222222',
        readableId: 'GreenAppleHunter123',
        publicName: 'Pikachu',
        status: 'active',
        isMainCharacter: true,
        bio: 'Electric mouse Pokemon',
        createdAt: '2026-10-15T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Maximum of 3 active characters reached' })
  async create(@CurrentUser('sub') userId: string, @Body() dto: CreateCharacterDto) {
    return this.charactersService.create(userId, dto);
  }

  @Get(':readableId')
  @Public()
  @ApiOperation({ summary: 'Get character public profile' })
  @ApiParam({ name: 'readableId', example: 'GreenAppleHunter123' })
  @ApiOkResponse({
    description: 'Character public profile',
    schema: {
      example: {
        readableId: 'GreenAppleHunter123',
        publicName: 'Pikachu',
        bio: 'Electric mouse Pokemon',
        avatarUrl: 'https://example.com/avatar.png',
        customTitle: 'Champion',
        signature: 'Gotta catch em all',
        createdAt: '2026-10-15T00:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Character not found' })
  async getByReadableId(@Param('readableId') readableId: string) {
    return this.charactersService.getPublicProfile(readableId);
  }

  @Patch(':readableId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update character profile' })
  @ApiParam({ name: 'readableId', example: 'GreenAppleHunter123' })
  @ApiOkResponse({
    description: 'Updated character profile',
    schema: {
      example: {
        readableId: 'GreenAppleHunter123',
        publicName: 'Raichu',
        bio: 'Evolved electric mouse',
        avatarUrl: 'https://example.com/avatar.png',
        customTitle: 'Champion',
        signature: 'Gotta catch em all',
        createdAt: '2026-10-15T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Not the owner, or character is banned' })
  @ApiNotFoundResponse({ description: 'Character not found' })
  async updateProfile(
    @Param('readableId') readableId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateCharacterDto,
  ) {
    return this.charactersService.updateProfile(userId, readableId, dto);
  }

  @Patch(':readableId/readable-id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change character readable ID (one-time rename)' })
  @ApiParam({ name: 'readableId', example: 'GreenAppleHunter123' })
  @ApiOkResponse({
    description: 'Character with the new readable ID',
    schema: {
      example: {
        readableId: 'BlueOceanRunner456',
        publicName: 'Pikachu',
        bio: 'Electric mouse Pokemon',
        avatarUrl: 'https://example.com/avatar.png',
        customTitle: 'Champion',
        signature: 'Gotta catch em all',
        createdAt: '2026-10-15T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid readable ID format' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Not the owner, banned, or already renamed' })
  @ApiNotFoundResponse({ description: 'Character not found' })
  @ApiConflictResponse({ description: 'Readable ID already taken' })
  async changeReadableId(
    @Param('readableId') readableId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateReadableIdDto,
  ) {
    return this.charactersService.changeReadableId(userId, readableId, dto);
  }

  @Post(':readableId/set-main')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set character as main character' })
  @ApiParam({ name: 'readableId', example: 'GreenAppleHunter123' })
  @ApiOkResponse({
    description: 'Character set as main character',
    schema: {
      example: {
        id: '22222222-2222-4222-8222-222222222222',
        readableId: 'GreenAppleHunter123',
        publicName: 'Pikachu',
        status: 'active',
        isMainCharacter: true,
        bio: 'Electric mouse Pokemon',
        createdAt: '2026-10-15T00:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Not the owner, or character is banned' })
  @ApiNotFoundResponse({ description: 'Character not found' })
  async setMainCharacter(
    @Param('readableId') readableId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.charactersService.setMainCharacter(userId, readableId);
  }

  @Delete(':readableId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete character (soft delete)' })
  @ApiParam({ name: 'readableId', example: 'GreenAppleHunter123' })
  @ApiNoContentResponse({ description: 'Character soft deleted' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Not the owner or admin' })
  @ApiNotFoundResponse({ description: 'Character not found' })
  async deleteCharacter(
    @Param('readableId') readableId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    await this.charactersService.deleteCharacter(userId, role, readableId);
  }

  @Get(':readableId/topics')
  @Public()
  @ApiOperation({ summary: "List character's topics" })
  @ApiParam({ name: 'readableId', example: 'GreenAppleHunter123' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({
    description: "Character's topics newest first",
    schema: {
      example: [
        {
          id: '55555555-5555-4555-8555-555555555555',
          title: 'Best starter?',
          forumName: 'General Discussion',
          replyCount: 5,
          createdAt: '2026-10-15T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Character not found' })
  async getCharacterTopics(
    @Param('readableId') readableId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.charactersService.getCharacterTopics(readableId, query);
  }

  @Get(':readableId/friends')
  @Public()
  @ApiOperation({ summary: "List character's friends" })
  @ApiParam({ name: 'readableId', example: 'GreenAppleHunter123' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({
    description: "Character's friends newest first",
    schema: {
      example: [
        {
          readableId: 'BlueOceanRunner456',
          publicName: 'Charmander',
          avatarUrl: 'https://example.com/avatar.png',
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Character not found' })
  async getCharacterFriends(
    @Param('readableId') readableId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.charactersService.getCharacterFriends(readableId, query);
  }

  @Get(':readableId/posts')
  @Public()
  @ApiOperation({ summary: "List character's posts" })
  @ApiParam({ name: 'readableId', example: 'GreenAppleHunter123' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiOkResponse({
    description: "Character's posts newest first",
    schema: {
      example: [
        {
          id: '66666666-6666-4666-8666-666666666666',
          topicId: '55555555-5555-4555-8555-555555555555',
          topicTitle: 'Best starter?',
          bodyPreview: 'Pikachu is the best starter...',
          createdAt: '2026-10-15T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: 'Character not found' })
  async getCharacterPosts(
    @Param('readableId') readableId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.charactersService.getCharacterPosts(readableId, query);
  }
}
