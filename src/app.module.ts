import { Module } from '@nestjs/common';
// ServeStaticModule removed - using Cloudinary for image storage
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MessagesModule } from './messages/messages.module';
import { ListingsModule } from './listings/listings.module';
import { AppController } from './app.controller';
import { UploadModule } from './upload/upload.module';
import { OffersModule } from './offers/offers.module';
import { ChatModule } from './chat/chat.module';
import { DataProtectionService } from './data-protection.service';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Images are now stored in Cloudinary, no local static serving needed
    PrismaModule,
    AuthModule,
    UserModule,
    MessagesModule,
    ListingsModule,
    UploadModule,
    OffersModule,
    ChatModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [DataProtectionService],
})
export class AppModule {}
