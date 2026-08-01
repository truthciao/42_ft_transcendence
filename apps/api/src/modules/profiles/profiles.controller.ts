import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    email: string;
    username: string;
  };
}

@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  getMyProfile(@Req() req: RequestWithUser) {
    return this.profilesService.getProfile(req.user.userId);
  }

  @Patch('me')
  updateMyProfile(@Req() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(req.user.userId, dto);
  }

  @Get(':userId')
  getProfile(@Param('userId') rawUserId: string) {
    const userId = Number(rawUserId);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.profilesService.findProfileByUserId(userId);
  }
}
