import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryDbService } from '../cloudinary-db.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, CloudinaryDbService],
  exports: [UserService],
})
export class UserModule {}
