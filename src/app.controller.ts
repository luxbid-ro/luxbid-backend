import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  getHello(): string {
    return 'LuxBid Backend is running!';
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'luxbid-backend'
    };
  }

  @Get('health/db')
  async getDbHealth(): Promise<object> {
    try {
      const usersCount = await this.prisma.user.count();
      return {
        status: 'healthy',
        db: 'ok',
        usersCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('DB health error:', { message: error?.message, code: error?.code });
      return {
        status: 'degraded',
        db: 'error',
        error: { message: error?.message, code: error?.code },
        timestamp: new Date().toISOString(),
      };
    }
  }
}
