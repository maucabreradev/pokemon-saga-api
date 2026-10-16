import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCharacterDto } from './dto/create-character.dto';
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
}
