import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { SendFriendRequestDto } from './dto/send-friend-request.dto.js';
import { FriendsService } from './friends.service.js';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('requests')
  sendRequest(
    @CurrentUser('userId') userId: number,
    @Body() dto: SendFriendRequestDto,
  ) {
    return this.friendsService.sendRequest(userId, dto.addresseeId);
  }

  @Get('requests')
  getPendingRequests(@CurrentUser('userId') userId: number) {
    return this.friendsService.getPendingRequests(userId);
  }

  @Post('requests/:id/accept')
  acceptRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.friendsService.acceptRequest(id, userId);
  }

  @Post('requests/:id/reject')
  rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.friendsService.rejectRequest(id, userId);
  }

  @Get()
  getFriends(@CurrentUser('userId') userId: number) {
    return this.friendsService.getFriends(userId);
  }

  @Delete(':userId')
  removeFriend(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.friendsService.removeFriend(userId, targetUserId);
  }
}
