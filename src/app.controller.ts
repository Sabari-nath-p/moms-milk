import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check API health status' })
  async healthCheck() {
    const healthStatus = await this.appService.getHealthStatus();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      ...healthStatus
    };
  }
}
