import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryDbService } from '../cloudinary-db.service';
import { RegisterDto } from './dto/register.dto';
import { PersonType } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cloudinaryDb: CloudinaryDbService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user data
    const userData = {
      email: registerDto.email,
      password: hashedPassword,
      personType: (registerDto.personType === 'fizica' ? PersonType.FIZICA : PersonType.JURIDICA),
      phone: registerDto.phone,
      address: registerDto.address,
      city: registerDto.city,
      county: registerDto.county,
      postalCode: registerDto.postalCode,
      country: registerDto.country || 'România',
    };

    // Add specific fields based on person type
    if (registerDto.personType === 'fizica') {
      Object.assign(userData, {
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        cnp: registerDto.cnp,
      });
    } else {
      Object.assign(userData, {
        companyName: registerDto.companyName,
        cui: registerDto.cui,
        regCom: registerDto.regCom,
      });
    }

    try {
      // Create user in local database
      const user = await this.prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          personType: true,
          firstName: true,
          lastName: true,
          companyName: true,
          phone: true,
          createdAt: true,
        },
      });

      // 🔒 ALSO SAVE TO CLOUDINARY for persistence!
      try {
        await this.cloudinaryDb.saveUser({
          ...userData,
          id: user.id,
          createdAt: user.createdAt
        });
        console.log('✅ User saved to Cloudinary backup!');
      } catch (cloudinaryError) {
        console.error('⚠️ Failed to save to Cloudinary:', cloudinaryError.message);
        // Don't fail registration if Cloudinary fails
      }

      // Generate JWT token
      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);

      return {
        user,
        accessToken,
      };
    } catch (error: any) {
      // Known Prisma unique constraint violation
      if (error?.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      // Log for diagnostics (will show in Render logs)
      // eslint-disable-next-line no-console
      console.error('Register error:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
      });
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    // Find user in local database
    let user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    // 🔒 If not found locally, try to restore from Cloudinary
    if (!user) {
      console.log('🔍 User not found locally, checking Cloudinary...');
      
      try {
        const cloudinaryUser = await this.cloudinaryDb.loadUser(loginDto.email);
        
        if (cloudinaryUser) {
          console.log('✅ User found in Cloudinary, restoring to local DB...');
          
          // Restore user to local database
          user = await this.prisma.user.create({
            data: {
              email: cloudinaryUser.email,
              password: cloudinaryUser.password,
              personType: cloudinaryUser.personType,
              firstName: cloudinaryUser.firstName || 'Restored',
              lastName: cloudinaryUser.lastName || 'User',
              phone: cloudinaryUser.phone || '+40700000000',
              address: cloudinaryUser.address || 'Restored Address',
              city: cloudinaryUser.city || 'București',
              county: cloudinaryUser.county || 'București',
              postalCode: cloudinaryUser.postalCode || '010001',
              country: cloudinaryUser.country || 'România',
              isVerified: cloudinaryUser.isVerified || false,
              isAdmin: cloudinaryUser.isAdmin || false
            }
          });
          
          console.log('🎉 User successfully restored from Cloudinary!');
        }
      } catch (cloudinaryError) {
        console.error('⚠️ Failed to restore from Cloudinary:', cloudinaryError.message);
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        personType: user.personType,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }
}
