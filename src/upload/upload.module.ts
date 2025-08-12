import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadController } from './upload.controller';
import { CloudinaryHealthController } from './cloudinary-health.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UploadController, CloudinaryHealthController],
})
export class UploadModule {}


