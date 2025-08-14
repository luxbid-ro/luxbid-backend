import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "fallback-jwt-secret-change-in-production",
    });
  }

  async validate(payload: { sub: string; email: string }) {
    console.log('🔍 JWT Strategy validating:', { sub: payload.sub, email: payload.email });
    
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          personType: true,
          firstName: true,
          lastName: true,
          companyName: true,
          phone: true,
        },
      });
      
      console.log('✅ Found user:', user ? { id: user.id, email: user.email } : 'NULL');
      
      if (!user) {
        console.log('❌ User not found in database for ID:', payload.sub);
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      console.error('❌ JWT Strategy error:', error.message);
      throw error;
    }
  }
}
