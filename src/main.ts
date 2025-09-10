import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { PrismaService } from './prisma/prisma.service';

// Force Render deployment - v2.0.1
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // SAFE DB migration - NO FORCE RESET!
  try {
    const { execSync } = require('child_process');
    console.log('🔄 Running SAFE DB migration...');
    // REMOVED --force-reset and --accept-data-loss to preserve data!
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ SAFE DB migration completed - data preserved');
  } catch (error) {
    console.log('⚠️ Migration failed, trying app-level fix:', error.message);
    
    // App-level table creation
    try {
      const prismaService = app.get(PrismaService);
      await prismaService.$executeRaw`
        CREATE TYPE IF NOT EXISTS "PersonType" AS ENUM ('FIZICA', 'JURIDICA');
        
        CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "personType" "PersonType" NOT NULL,
          "firstName" TEXT,
          "lastName" TEXT,
          "cnp" TEXT,
          "companyName" TEXT,
          "cui" TEXT,
          "regCom" TEXT,
          "phone" TEXT NOT NULL,
          "address" TEXT NOT NULL,
          "city" TEXT NOT NULL,
          "county" TEXT NOT NULL,
          "postalCode" TEXT NOT NULL,
          "country" TEXT NOT NULL DEFAULT 'România',
          "isVerified" BOOLEAN NOT NULL DEFAULT false,
          "isAdmin" BOOLEAN NOT NULL DEFAULT false,
          "emailVerificationCode" TEXT,
          "emailVerificationExpires" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
        
        -- Data protection: Only create tables if they don't exist (preserve existing data)
        -- This prevents any accidental data loss during deployments
      `;
      console.log('✅ App-level table creation completed');
    } catch (appError) {
      console.log('⚠️ App-level creation also failed:', appError.message);
    }
  }
  

  
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
    forbidNonWhitelisted: false, // allow extra fields (e.g., legacy 'name') without rejecting
    transform: true,
  }));
  
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 LuxBid Backend running on http://localhost:${port}`);
}

bootstrap();
// Force redeploy v3 - Mon Aug 11 22:30:30 EEST 2025
// Force redeploy
