import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with dynamic origin allow-list
  const rawOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '').trim();
  const parsedEnvOrigins = rawOrigins
    ? rawOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  const defaultOrigins = [
    'http://localhost:3000',
    'https://luxbid.ro',
    'https://www.luxbid.ro',
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...parsedEnvOrigins]));

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (like curl) with no origin
      if (!origin) return callback(null, true);
      try {
        const isAllowedExact = allowedOrigins.includes(origin);
        // Also allow any Vercel preview/prod deployment for this project
        const hostname = new URL(origin).hostname;
        const isVercel = hostname.endsWith('.vercel.app');
        if (isAllowedExact || isVercel) {
          return callback(null, true);
        }
      } catch (_) {
        // If origin parsing fails, deny
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 LuxBid Backend running on http://localhost:${port}`);
}

bootstrap();
