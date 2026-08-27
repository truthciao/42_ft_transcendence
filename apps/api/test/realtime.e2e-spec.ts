import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import { io, type Socket } from 'socket.io-client';

import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { cleanDatabase } from './helpers/clean-database.js';
import { registerAndLogin } from './helpers/auth.js';

jest.mock('otplib', () => ({
  generateSecret: jest.fn(() => 'test-secret'),
  generate: jest.fn(() => '123456'),
  generateURI: jest.fn(() => 'otpauth://totp/test'),
  verify: jest.fn(() => ({
    valid: true,
    delta: 0,
  })),
}));

describe('Realtime (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let baseUrl: string;
  let socket: Socket | undefined;

  const testUser = {
    email: 'e2e-realtime@example.com',
    username: 'e2e_realtime_user',
    password: 'StrongPassword123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    await app.listen(0);

    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);

    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Could not determine test server port');
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterEach(() => {
    socket?.disconnect();
    socket = undefined;
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  it('connects with a valid JWT', async () => {
    const token = await registerAndLogin(server, testUser);

    socket = io(baseUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
      autoConnect: false,
    });

    const connected = new Promise<{
      userId: number;
      username: string;
    }>((resolve, reject) => {
      socket?.once('connected', resolve);
      socket?.once('connect_error', reject);
    });

    socket.connect();

    const payload = await connected;

    expect(payload).toEqual({
      userId: expect.any(Number),
      username: testUser.username,
    });

    expect(socket.connected).toBe(true);
  });

  it('responds to ping with pong', async () => {
    const token = await registerAndLogin(server, testUser);

    socket = io(baseUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      socket?.once('connect', () => resolve());
      socket?.once('connect_error', reject);
    });

    const pong = new Promise<{ timestamp: number }>((resolve) => {
      socket?.once('pong', resolve);
    });

    socket.emit('ping');

    const payload = await pong;

    expect(payload).toEqual({
      timestamp: expect.any(Number),
    });

    expect(payload.timestamp).toBeGreaterThan(0);
  });
});
