import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ForumsService } from './forums.service';

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
}
