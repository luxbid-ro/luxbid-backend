import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CloudinaryDbService } from '../cloudinary-db.service';

@Module({
  controllers: [UserController],
  providers: [UserService, CloudinaryDbService],
  exports: [UserService],
})
export class UserModule {}
