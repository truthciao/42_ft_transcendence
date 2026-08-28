import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ChatService } from './chat.service.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { GetMessagesDto } from './dto/get-messages.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  createDirectConversation(
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createDirectConversation(userId, dto.targetUserId);
  }

  @Post('conversations/by-username')
  async createByUsername(
    @CurrentUser('userId') userId: number,
    @Body('username') username: string,
  ) {
    return this.chatService.createByUsername(userId, username);
  }

  @Get('conversations')
  findMine(@CurrentUser('userId') userId: number) {
    return this.chatService.findAllForUser(userId);
  }

  @Get('conversations/:id/message')
  getMessage(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetMessagesDto,
  ) {
    return this.chatService.getMessages(id, userId, query);
  }

  @Get('conversations/:id/messages/search')
  searchMessages(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Query('q') query: string,
  ) {
    return this.chatService.searchMessages(
      id,
      userId,
      query,
    );
  }

  @Patch('conversations/:id/message')
  async markAsRead(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.chatService.markAsRead(userId, id);

    return { success: true };
  }

}
