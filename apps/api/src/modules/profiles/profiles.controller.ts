import { BadRequestException, Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  getMyProfile(@Req() req: Request) {
    return this.profilesService.getProfile(this.getUserId(req));
  }

  @Patch('me')
  updateMyProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    return this.profilesService.updateProfile(this.getUserId(req), dto);
  }

  @Get(':userId')
  getProfile(@Param('userId') rawUserId: string) {
    const userId = Number(rawUserId);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.profilesService.findProfileByUserId(userId);
  }

  private getUserId(req: Request): number {
    const rawUserId = req.headers['x-user-id'];
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    const parsed = Number(userId);

    if (!userId || !Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('Invalid X-User-Id header');
    }

    return parsed;
  }
}
