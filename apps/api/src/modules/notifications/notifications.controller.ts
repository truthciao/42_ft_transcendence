import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
  Body,
  Put,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { NotificationsService } from './notifications.service.js';
import { UpdatePreferencesDto } from './dto/update-preferences.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getNotifications(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.getNotifications(
      req.user.userId,
    );
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  getUnreadCount(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.getUnreadCount(
      req.user.userId,
    );
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.notificationsService.markAsRead(
      id,
      req.user.userId,
    );
  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.markAllAsRead(
      req.user.userId,
    );
  }
  
  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  getPreferences(@CurrentUser('userId') userId: number) {
    return this.notificationsService.getPreferences(userId);
  }
  
  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  updatePreferences(
    @CurrentUser('userId') userId: number,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.notificationsService.updatePreferences(userId, dto.preferences);
  }
}
