import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { SendEmailVerificationDto, VerifyEmailDto, ResendVerificationDto } from './dto/email-verification.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestPasswordResetDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Email verification endpoints
  @Post('send-email-verification')
  @HttpCode(HttpStatus.OK)
  async sendEmailVerification(@Body() sendEmailVerificationDto: SendEmailVerificationDto) {
    return this.authService.sendEmailVerification(sendEmailVerificationDto.email);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.email, verifyEmailDto.code);
  }

  @Post('resend-verification-code')
  @HttpCode(HttpStatus.OK)
  async resendVerificationCode(@Body() resendVerificationDto: ResendVerificationDto) {
    return this.authService.resendVerificationCode(resendVerificationDto.email);
  }
}
