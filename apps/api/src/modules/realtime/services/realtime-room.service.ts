import { Injectable } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import { getUserRoom } from '../utils/room-naming.util.js';

@Injectable()
export class RealtimeRoomService {
  private server: Server | null = null;

  setServer(server: Server): void {
    this.server = server;
  }

  private requireServer(): Server {
    if (!this.server) {
      throw new Error(
        'RealtimeRoomService used before the gateway finished initializing',
      );
    }
    return this.server;
  }

  async joinRoom(client: Socket, room: string): Promise<void> {
    await client.join(room);
  }

  async leaveRoom(client: Socket, room: string): Promise<void> {
    await client.leave(room);
  }

  isSocketInRoom(client: Socket, room: string): boolean {
    return client.rooms.has(room);
  }

  async isUserInRoom(userId: number, room: string): Promise<boolean> {
    const sockets = await this.requireServer().in(room).fetchSockets();

    const isInRoom = sockets.some(
      (socket) => socket.data.user?.userId === userId,
    );

    console.log(
      `[IS USER IN ROOM] userId=${userId} room=${room} sockets=${sockets.length} result=${isInRoom}`,
    );

    return isInRoom;
  }

  async getRoomMemberSocketIds(room: string): Promise<string[]> {
    const sockets = await this.requireServer().in(room).fetchSockets();
    return sockets.map((socket) => socket.id);
  }

  async getRoomMemberCount(room: string): Promise<number> {
    return (await this.getRoomMemberSocketIds(room)).length;
  }

  emitToRoom<T>(room: string, event: string, payload: T): void {
    this.requireServer().to(room).emit(event, payload);
  }

  emitToRoomExcept<T>(
    client: Socket,
    room: string,
    event: string,
    payload: T,
  ): void {
    client.to(room).emit(event, payload);
  }

  emitToUser<T>(userId: number, event: string, payload: T): void {
    const room = getUserRoom(userId);

    console.log(
      `[REALTIME EMIT TO USER] userId=${userId} room=${room} event=${event}`,
      payload,
    );

    this.emitToRoom(getUserRoom(userId), event, payload);
  }
}
