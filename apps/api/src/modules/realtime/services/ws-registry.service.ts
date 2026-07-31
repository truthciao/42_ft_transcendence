import { Injectable } from "@nestjs/common";

@Injectable()
export class SocketRegistryService {
  private readonly userSockets = new Map<number, Set<string>>();
  private readonly socketUsers = new Map<string, number>();

  registerSocket(userId: number, socketId: string): void {
    this.socketUsers.set(socketId, userId);
  }
}
