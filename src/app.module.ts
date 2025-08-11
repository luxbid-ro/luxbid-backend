import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Serve uploaded images from /uploads
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    MessagesModule,
    ListingsModule,
    UploadModule,
    OffersModule,
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
