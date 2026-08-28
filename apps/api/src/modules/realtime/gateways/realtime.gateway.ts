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
import { DocumentsService } from '../../documents/documents.service.js';
import { getDocumentRoom } from '../utils/document-room-naming.util.js';
import { DocumentsYjsService } from '../../documents/documents-yjs.service.js';
import * as Y from 'yjs';

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
  private readonly socketDocuments = new Map<
    string,
    Set<number>
  >();

  notifyConversationCreated(
    userIds: number[],
    conversationId: number,
  ): void {
    for (const userId of userIds) {
      this.server
        .to(getUserRoom(userId))
        .emit(REALTIME_EVENTS.CONVERSATION_CREATED, {
          conversationId,
        });
    }
  }

  constructor(
    private readonly wsAuthService: WsAuthService,
    private readonly socketRegistry: SocketRegistryService,
    private readonly roomService: RealtimeRoomService,
    private readonly documentsService: DocumentsService,
    private readonly documentsYjsService: DocumentsYjsService,
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

      client.emit(REALTIME_EVENTS.USERS_ONLINE, {
        userIds: this.socketRegistry.getOnlineUserIds(),
      });
      this.server.emit(REALTIME_EVENTS.USER_ONLINE, {
        userId: user.userId,
      });
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

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = this.socketRegistry.getUserId(client.id);

    const documents = this.socketDocuments.get(client.id);

    if (documents) {
      for (const documentId of documents) {
        const room = getDocumentRoom(documentId);

        const memberCount =
          await this.roomService.getRoomMemberCount(room);

        if (memberCount === 1) {
          this.documentsYjsService.removeDoc(documentId);
        }
      }

      this.socketDocuments.delete(client.id);
    }

    this.socketRegistry.unregisterSocket(client.id);

    if (
      userId !== undefined &&
      !this.socketRegistry.isUserOnline(userId)
    ) {
      this.server.emit(REALTIME_EVENTS.USER_OFFLINE, {
        userId,
      });
    }

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

  @SubscribeMessage(REALTIME_EVENTS.DOCUMENT_JOIN)
  async handleDocumentJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: { documentId: number },
  ): Promise<WsResponse<{ documentId: number }>> {
this.logger.log(
  `[DOCUMENT JOIN] socket=${client.id} document=${dto.documentId}`,
);
    await this.documentsService.findByIdForUser(
      dto.documentId,
      client.data.user.userId,
    );

    const room = getDocumentRoom(dto.documentId);

    await this.roomService.joinRoom(client, room);

    let documents = this.socketDocuments.get(client.id);

    if (!documents) {
      documents = new Set<number>();
      this.socketDocuments.set(client.id, documents);
    }

    documents.add(dto.documentId);

    const ydoc = await this.documentsYjsService.getDoc(
      dto.documentId,
      client.data.user.userId,
    );

    const state = Y.encodeStateAsUpdate(ydoc);

    client.emit(REALTIME_EVENTS.DOCUMENT_SYNC, {
      documentId: dto.documentId,
      update: Buffer.from(state),
    });

    return {
      event: REALTIME_EVENTS.DOCUMENT_JOINED,
      data: {
        documentId: dto.documentId,
      },
    };
  }

  @SubscribeMessage(REALTIME_EVENTS.DOCUMENT_LEAVE)
  async handleDocumentLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: { documentId: number },
  ): Promise<WsResponse<{ documentId: number }>> {
    const room = getDocumentRoom(dto.documentId);

    await this.roomService.leaveRoom(client, room);

    const documents = this.socketDocuments.get(client.id);

    documents?.delete(dto.documentId);

    if (documents?.size === 0) {
      this.socketDocuments.delete(client.id);
    }

    const memberCount =
      await this.roomService.getRoomMemberCount(room);

    if (memberCount === 0) {
      this.documentsYjsService.removeDoc(dto.documentId);
    }

    return {
      event: REALTIME_EVENTS.DOCUMENT_LEFT,
      data: {
        documentId: dto.documentId,
      },
    };
  }

  @SubscribeMessage(REALTIME_EVENTS.DOCUMENT_TITLE_UPDATED)
  async handleDocumentTitleUpdated(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    dto: {
      documentId: number;
      title: string;
    },
  ): Promise<void> {
    await this.documentsService.findByIdForUser(
      dto.documentId,
      client.data.user.userId,
    );

    const room = getDocumentRoom(dto.documentId);

    if (!this.roomService.isSocketInRoom(client, room)) {
      return;
    }

    client.to(room).emit(
      REALTIME_EVENTS.DOCUMENT_TITLE_UPDATED,
      {
        documentId: dto.documentId,
        title: dto.title,
      },
    );
  }

  @SubscribeMessage(REALTIME_EVENTS.DOCUMENT_YJS_UPDATE)
  async handleDocumentYjsUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    dto: {
      documentId: number;
      update: number[];
    },
  ): Promise<void> {
    await this.documentsService.findByIdForUser(
      dto.documentId,
      client.data.user.userId,
    );

    const room = getDocumentRoom(dto.documentId);

    if (!this.roomService.isSocketInRoom(client, room)) {
      return;
    }

    const update = new Uint8Array(dto.update);

    await this.documentsYjsService.applyUpdate(
      dto.documentId,
      client.data.user.userId,
      update,
    );

    await this.documentsYjsService.save(
      dto.documentId,
      client.data.user.userId,
    );

    client.to(room).emit(
      REALTIME_EVENTS.DOCUMENT_YJS_UPDATE,
      {
        documentId: dto.documentId,
        update: dto.update,
      },
    );
  }
}
