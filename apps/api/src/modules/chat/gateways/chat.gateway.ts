import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import { ALLOWED_ORIGINS } from '../../../config/cors.config';
import type { AuthenticatedSocket } from '../../realtime/interfaces/authenticated-socket.interface';
import { RealtimeRoomService } from '../../realtime/services/realtime-room.service';
import { CHAT_EVENTS } from '../chat.constants';
import { ChatService } from '../chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { getChatRoom } from '../utils/chat-room-naming.util';
import { WsJwtGuard } from '../../realtime/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RealtimeRoomService,
  ) {}

  @SubscribeMessage(CHAT_EVENTS.MESSAGE_SEND)
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: SendMessageDto,
  ): Promise<void> {
    const senderId = client.data.user.userId;

    try {
      const message = await this.chatService.createMessage(
        dto.conversationId,
        senderId,
        dto.content,
      );

      this.roomService.emitToRoom(
        getChatRoom(dto.conversationId),
        CHAT_EVENTS.MESSAGE_CREATED,
        message,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unable to send message';
      throw new WsException(errorMessage);
    }
  }
}
