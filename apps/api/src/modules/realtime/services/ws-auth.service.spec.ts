import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { WsAuthService } from './ws-auth.service.js';
import { jest } from '@jest/globals';

type MockJwtPayload = {
  sub: number;
  email: string;
  username: string;
};

type MockUser = {
  id: number;
  email: string;
  username: string;
};

const jwtService = {
  verifyAsync: jest.fn<() => Promise<MockJwtPayload>>(),
};

const prisma = {
  user: {
    findUnique: jest.fn<() => Promise<MockUser | null>>(),
  },
};

function createSocket(overrides: Partial<Socket['handshake']> = {}): Socket {
  return {
    handshake: {
      auth: {},
      headers: {},
      query: {},
      ...overrides,
    },
  } as unknown as Socket;
}

describe('WsAuthService', () => {
  let service: WsAuthService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new WsAuthService(
      jwtService as unknown as JwtService,
      prisma as unknown as PrismaService,
    );
  });

  describe('extractToken', () => {
    it('reads the token from handshake.auth.token', () => {
      const client = createSocket({ auth: { token: 'abc' } });
      expect(service.extractToken(client)).toBe('abc');
    });

    it('falls back to the Authorization header', () => {
      const client = createSocket({ headers: { authorization: 'Bearer xyz' } });
      expect(service.extractToken(client)).toBe('xyz');
    });

    it('falls back to the query string', () => {
      const client = createSocket({ query: { token: 'qrs' } });
      expect(service.extractToken(client)).toBe('qrs');
    });

    it('returns null when no token is present', () => {
      expect(service.extractToken(createSocket())).toBeNull();
    });
  });

  describe('authenticate', () => {
    it('throws when no token is provided', async () => {
      await expect(service.authenticate(createSocket())).rejects.toThrow(
        WsException,
      );
    });

    it('throws when the token is invalid', async () => {
      const client = createSocket({ auth: { token: 'bad' } });
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.authenticate(client)).rejects.toThrow(WsException);
    });

    it('throws when the user no longer exists', async () => {
      const client = createSocket({ auth: { token: 'good' } });
      jwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        email: 'a@a.com',
        username: 'a',
      });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.authenticate(client)).rejects.toThrow(WsException);
    });

    it('returns the authenticated user on success', async () => {
      const client = createSocket({ auth: { token: 'good' } });
      jwtService.verifyAsync.mockResolvedValue({
        sub: 1,
        email: 'a@a.com',
        username: 'a',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'a@a.com',
        username: 'a',
      });

      await expect(service.authenticate(client)).resolves.toEqual({
        userId: 1,
        email: 'a@a.com',
        username: 'a',
      });
    });
  });
});
