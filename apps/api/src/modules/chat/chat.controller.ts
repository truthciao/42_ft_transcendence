import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

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

  @Get('conversations')
  findMine(@CurrentUser('userId') userId: number) {
    return this.chatService.findAllForUser(userId);
  }

  @Get('conversation/:id/message')
  getMessage(
    @CurrentUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.chatService.getMessages(id, userId);
  }
}
