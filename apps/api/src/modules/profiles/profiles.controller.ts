import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ProfilesService } from './profiles.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { extname } from 'node:path';
import { diskStorage } from 'multer';

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

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

          callback(null, filename);
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (_req, file, callback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Only JPEG, PNG, and WebP images are allowed',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadAvatar(
    @CurrentUser('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }
    return this.profilesService.uploadAvatar(userId, file);
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
