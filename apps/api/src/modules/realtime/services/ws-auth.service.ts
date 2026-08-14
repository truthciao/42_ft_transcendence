import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface.js';
import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface.js';

@Injectable()
export class WsAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  extractToken(client: Socket): string | null {
    const autoToken = client.handshake.auth?.token as string | undefined;
    if (typeof autoToken === 'string' && autoToken.length > 0) return autoToken;

    const header = client.handshake.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice('Bearer '.length);
    }

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.length > 0) {
      return queryToken;
    }

    return null;
  }

  async authenticate(client: Socket): Promise<AuthenticatedUser> {
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new WsException('Invalid or expired token');
    }

    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId < 1) {
      throw new WsException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new WsException('User no longer exists');
    }

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
  }
}
