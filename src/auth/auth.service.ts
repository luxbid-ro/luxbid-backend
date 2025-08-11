import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { PersonType } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
      personType: registerDto.personType,
      phone: registerDto.phone,
      address: registerDto.address,
      city: registerDto.city,
      county: registerDto.county,
      postalCode: registerDto.postalCode,
      country: registerDto.country || 'România',
    };

    // Add specific fields based on person type
    if (registerDto.personType === PersonType.FIZICA) {
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

    // Create user
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

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

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
