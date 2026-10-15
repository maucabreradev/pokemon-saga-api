import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: 'Authenticated user profile',
    schema: {
      example: {
        id: '11111111-1111-4111-8111-111111111111',
        email: 'ash.ketchum@pallettown.gg',
        role: 'user',
        createdAt: '2026-10-15T00:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user email' })
  @ApiOkResponse({
    description: 'Updated user profile',
    schema: {
      example: {
        id: '11111111-1111-4111-8111-111111111111',
        email: 'misty.cerulean@pallettown.gg',
        role: 'user',
        createdAt: '2026-10-15T00:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid email format' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email already registered' })
  updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateEmail(userId, dto.email);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  @ApiNoContentResponse({ description: 'Password changed, all sessions revoked' })
  @ApiBadRequestResponse({ description: 'Invalid new password' })
  @ApiUnauthorizedResponse({ description: 'Current password is incorrect' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async changePassword(@CurrentUser('sub') userId: string, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  @Get('me/characters')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user characters' })
  @ApiOkResponse({
    description: 'Character summaries owned by the authenticated user',
    schema: {
      example: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          readableId: 'GreenAppleHunter123',
          publicName: 'Pikachu',
          status: 'active',
          isMainCharacter: true,
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  getMyCharacters(@CurrentUser('sub') userId: string) {
    return this.usersService.getMyCharacters(userId);
  }

  @Get('me/sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user active sessions' })
  @ApiOkResponse({
    description: 'Active sessions of the authenticated user (token hashes never exposed)',
    schema: {
      example: [
        {
          id: '44444444-4444-4444-8444-444444444444',
          createdAt: '2026-10-15T10:00:00.000Z',
          expiresAt: '2026-11-14T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  getMySessions(@CurrentUser('sub') userId: string) {
    return this.usersService.getMySessions(userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current user account (soft delete)' })
  @ApiNoContentResponse({ description: 'Account soft deleted, sessions revoked' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async deleteMe(@CurrentUser('sub') userId: string) {
    await this.usersService.deleteMe(userId);
  }
}
