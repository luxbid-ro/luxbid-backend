import { Controller, Get, Put, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserService } from './user.service';
import { UpdateProfileDto, ChangePasswordDto, DeleteAccountDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // Alias expected by frontend
  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.id, changePasswordDto);
  }

  @Delete('account')
  async deleteAccount(@Request() req, @Body() deleteAccountDto: DeleteAccountDto) {
    return this.userService.deleteAccount(req.user.id, deleteAccountDto.password);
  }

  // Temporary endpoint to reset email verification (remove guards for testing)
  @Post('reset-verification')
  async resetEmailVerification(@Body() body: { email: string }) {
    return this.userService.resetEmailVerification(body.email);
  }
}
