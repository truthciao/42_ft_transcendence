import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  getMyProfile(@CurrentUser('userId') userId: number) {
    return this.profilesService.getProfile(userId);
  }

  @Patch('me')
  updateMyProfile(
    @CurrentUser('userId') userId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateProfile(userId, dto);
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
