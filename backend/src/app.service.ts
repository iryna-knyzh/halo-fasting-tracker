import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getTestData() {
    this.logger.log('Test endpoint called');
    return {
      message: 'Backend is running!',
      timestamp: new Date().toISOString(),
      status: 'success',
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}
