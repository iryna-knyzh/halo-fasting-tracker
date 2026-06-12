import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Тестовий API')
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  @ApiOperation({ summary: 'Тестовий ендпоінт для перевірки роботи API' })
  @ApiResponse({
    status: 200,
    description: 'Тестові дані успішно отримано',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Backend is running!' },
        timestamp: { type: 'string', example: '2024-01-18T12:00:00.000Z' },
        status: { type: 'string', example: 'success' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getTestData() {
    return this.appService.getTestData();
  }
}
