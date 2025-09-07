import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryDbService } from '../cloudinary-db.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { PersonType } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cloudinaryDb: CloudinaryDbService,
    private emailService: EmailService,
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
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return { 
        message: 'Dacă email-ul există în sistem, vei primi instrucțiuni pentru resetarea parolei.' 
      };
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to database
    await this.prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        email,
        expiresAt,
      }
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { 
      message: 'Dacă email-ul există în sistem, vei primi instrucțiuni pentru resetarea parolei.' 
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Find and validate reset token
    const resetTokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetTokenRecord) {
      throw new NotFoundException('Token-ul de resetare nu este valid');
    }

    if (resetTokenRecord.used) {
      throw new UnauthorizedException('Token-ul de resetare a fost deja folosit');
    }

    if (new Date() > resetTokenRecord.expiresAt) {
      throw new UnauthorizedException('Token-ul de resetare a expirat');
    }

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: resetTokenRecord.email }
    });

    if (!user) {
      throw new NotFoundException('Utilizatorul nu a fost găsit');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and mark token as used
    await Promise.all([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { used: true }
      })
    ]);

    return { 
      message: 'Parola a fost resetată cu succes. Te poți loga cu noua parolă.' 
    };
  }

  // Email verification methods
  async sendEmailVerification(email: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new ConflictException('Email already verified');
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save verification code to database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpires: expiresAt,
      },
    });

    // Send verification email
    await this.emailService.sendEmailVerification(email, verificationCode);

    return { 
      message: 'Verification code sent successfully',
      expiresIn: 15, // minutes
      // TEMPORARY: Include code in response for testing (remove in production)
      verificationCode: verificationCode
    };
  }

  async verifyEmail(email: string, code: string) {
    // Find user with this verification code
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        emailVerificationCode: code,
        emailVerificationExpires: {
          gt: new Date(), // Code not expired
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Mark email as verified and clear verification code
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null,
      },
    });

    return { 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isVerified: true,
      }
    };
  }

  async resendVerificationCode(email: string) {
    // Check if user exists and is not verified
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new ConflictException('Email already verified');
    }

    // Check if there's a recent verification attempt (rate limiting)
    if (user.emailVerificationExpires && user.emailVerificationExpires > new Date()) {
      const timeLeft = Math.ceil((user.emailVerificationExpires.getTime() - Date.now()) / 1000 / 60);
      throw new ConflictException(`Please wait ${timeLeft} minutes before requesting a new code`);
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save verification code to database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpires: expiresAt,
      },
    });

    // Send verification email
    await this.emailService.sendEmailVerification(email, verificationCode);

    return { 
      message: 'New verification code sent successfully',
      expiresIn: 15 // minutes
    };
  }
}
