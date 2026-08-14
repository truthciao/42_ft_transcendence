import { Logger, UseGuards, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ALLOWED_ORIGINS } from '../../../config/cors.config.js';
import { JoinRoomDto } from '../dto/join-room.dto.js';
import { LeaveRoomDto } from '../dto/leave-room.dto.js';
import { WsJwtGuard } from '../guards/ws-jwt.guard.js';
import type { AuthenticatedSocket } from '../interfaces/authenticated-socket.interface.js';
import { REALTIME_EVENTS } from '../realtime.constants.js';
import { RealtimeRoomService } from '../services/realtime-room.service.js';
import { SocketRegistryService } from '../services/ws-registry.service.js';
import { WsAuthService } from '../services/ws-auth.service.js';
import { getUserRoom } from '../utils/room-naming.util.js';
import { WsZodValidationPipe } from '../pipes/ws-zod-validation.pipe.js';

@WebSocketGateway({
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
@UsePipes(WsZodValidationPipe)
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly wsAuthService: WsAuthService,
    private readonly socketRegistry: SocketRegistryService,
    private readonly roomService: RealtimeRoomService,
  ) {}

  afterInit(server: Server): void {
    this.roomService.setServer(server);
    this.logger.log('Realtime gateway initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await this.wsAuthService.authenticate(client);
      const authenticatedClient = client as AuthenticatedSocket;
      authenticatedClient.data.user = user;

      this.socketRegistry.registerSocket(user.userId, client.id);
      await this.roomService.joinRoom(client, getUserRoom(user.userId));

      this.logger.log(
        `Client connected: socket=${client.id} user=${user.username}`,
      );
      client.emit(REALTIME_EVENTS.CONNECTED, {
        userId: user.userId,
        username: user.username,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unauthorized';
      this.logger.warn(`Rejected connection ${client.id}: ${message}`);
      client.emit(REALTIME_EVENTS.ERROR, { message });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = this.socketRegistry.getUserId(client.id);
    this.socketRegistry.unregisterSocket(client.id);
    this.logger.log(
      `Client disconnected: socket=${client.id} user=${userId ?? 'unknown'}`,
    );
  }

  @SubscribeMessage(REALTIME_EVENTS.PING)
  handlePing(): WsResponse<{ timestamp: number }> {
    return {
      event: REALTIME_EVENTS.PONG,
      data: { timestamp: Date.now() },
    };
  }

  @SubscribeMessage(REALTIME_EVENTS.ROOM_JOIN)
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: JoinRoomDto,
  ): Promise<WsResponse<{ room: string; memberCount: number }>> {

    await this.roomService.joinRoom(client, dto.room);
    const memberCount = await this.roomService.getRoomMemberCount(dto.room);

    client.to(dto.room).emit(REALTIME_EVENTS.ROOM_MEMBER_JOINED, {
      room: dto.room,
      userId: client.data.user.userId,
      username: client.data.user.username,
    });

    this.logger.log(
      `socket=${client.id} user=${client.data.user.username} joined room=${dto.room}`,
    );

    return {
      event: REALTIME_EVENTS.ROOM_JOINED,
      data: { room: dto.room, memberCount },
    };
  }

  @SubscribeMessage(REALTIME_EVENTS.ROOM_LEAVE)
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: LeaveRoomDto,
  ): Promise<WsResponse<{ room: string; memberCount: number }>> {
    await this.roomService.leaveRoom(client, dto.room);
    const memberCount = await this.roomService.getRoomMemberCount(dto.room);

    client.to(dto.room).emit(REALTIME_EVENTS.ROOM_MEMBER_LEFT, {
      room: dto.room,
      userId: client.data.user.userId,
      username: client.data.user.username,
    });

    this.logger.log(
      `socket=${client.id} user=${client.data.user.username} left room=${dto.room}`,
    );

    return {
      event: REALTIME_EVENTS.ROOM_LEFT,
      data: { room: dto.room, memberCount },
    };
  }
}
