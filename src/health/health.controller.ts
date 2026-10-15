import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy', schema: { example: { status: 'ok', timestamp: '2026-10-14T12:00:00.000Z' } } })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}