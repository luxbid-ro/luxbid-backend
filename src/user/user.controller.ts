import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // Alias expected by frontend
  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }
}
