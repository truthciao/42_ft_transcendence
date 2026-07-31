import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketRegistryService {
  private readonly userSockets = new Map<number, Set<string>>();
  private readonly socketUsers = new Map<string, number>();

  registerSocket(userId: number, socketId: string): void {
    this.socketUsers.set(socketId, userId);

    const sockets = this.userSockets.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    this.userSockets.set(userId, sockets);
  }

  unregisterSocket(socketId: string): void {
    const userId = this.socketUsers.get(socketId);
    if (userId === undefined) {
      return;
    }

    this.socketUsers.delete(socketId);

    const sockets = this.userSockets.get(userId);
    if (!sockets) {
      return;
    }

    sockets.delete(socketId);
    if (sockets.size === 0) this.userSockets.delete(userId);
  }

  getSocketIds(userId: number): string[] {
    return Array.from(this.userSockets.get(userId) ?? []);
  }

  getUserId(socketId: string): number | undefined {
    return this.socketUsers.get(socketId);
  }

  isUserOnline(userId: number): boolean {
    return (this.userSockets.get(userId)?.size ?? 0) > 0;
  }

  getOnlineUserIds(): number[] {
    return Array.from(this.userSockets.keys());
  }
}
