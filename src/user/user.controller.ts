import { Controller, Get, Put, Post, UseGuards, Request, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserService } from './user.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.getUserProfile(req.user.sub);
  }

  // Alias expected by frontend
  @Get('me')
  async getMe(@Request() req) {
    return this.userService.getUserProfile(req.user.sub);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.sub, updateData);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req, @Body() changePasswordData: ChangePasswordDto) {
    return this.userService.changePassword(req.user.sub, changePasswordData);
  }

  @Post('delete-account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Request() req, @Body('password') password: string) {
    return this.userService.deleteAccount(req.user.sub, password);
  }
}
