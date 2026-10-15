import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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
}
