import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
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
}
