import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Performance optimizations
      transactionOptions: {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
      },
    });

    this.$on('error', (e) => {
      // eslint-disable-next-line no-console
      console.error('Prisma error:', e);
    });

    this.$on('warn', (e) => {
      // eslint-disable-next-line no-console
      console.warn('Prisma warning:', e);
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🚀 Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma disconnected from database');
  }

  // Performance monitoring
  async getConnectionInfo() {
    return {
      isConnected: await this.$queryRaw`SELECT 1`,
      timestamp: new Date().toISOString(),
    };
  }
}
