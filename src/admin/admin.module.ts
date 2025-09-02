import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ListingsModule } from '../listings/listings.module';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ListingsModule, UserModule, PrismaModule],
  controllers: [AdminController],
})
export class AdminModule {}
