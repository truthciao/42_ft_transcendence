import { UseGuards, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';

import { ALLOWED_ORIGINS } from '../../../config/cors.config.js';

import type { AuthenticatedSocket } from '../../realtime/interfaces/authenticated-socket.interface.js';
import { RealtimeRoomService } from '../../realtime/services/realtime-room.service.js';
import { WsJwtGuard } from '../../realtime/guards/ws-jwt.guard.js';
import { WsZodValidationPipe } from '../../realtime/pipes/ws-zod-validation.pipe.js';

import { CHAT_EVENTS } from '../chat.constants.js';
import { ChatService } from '../chat.service.js';
import { SendMessageDto } from '../dto/send-message.dto.js';
import { JoinConversationDto } from '../dto/join-conversation.dto.js';
import { getChatRoom } from '../utils/chat-room-naming.util.js';

@WebSocketGateway({
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
@UsePipes(new WsZodValidationPipe())
export class ChatGateway 
  implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RealtimeRoomService,
  ) {}

  afterInit(server: Server): void {
    this.roomService.setServer(server);
  }

  handleConnection(client: AuthenticatedSocket): void {
  }

  @SubscribeMessage(CHAT_EVENTS.CONVERSATION_JOIN)
  async handleConversationJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: JoinConversationDto,
  ): Promise<void> {
    const userId = client.data.user.userId;
    const room = getChatRoom(dto.conversationId);

    try {
      await this.chatService.verifyMembership(
        dto.conversationId,
        userId,
      );
      await this.roomService.joinRoom(client, room);
    
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to join conversation';

      throw new WsException(errorMessage);
    }
  }

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
      const room = getChatRoom(dto.conversationId);
      this.roomService.emitToRoom(
        room,
        CHAT_EVENTS.MESSAGE_CREATED,
        message,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to send message';

      throw new WsException(errorMessage);
    }
  }
}