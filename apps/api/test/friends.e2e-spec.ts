import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { cleanDatabase } from './helpers/clean-database.js';

jest.mock('otplib', () => ({
  generateSecret: jest.fn(() => 'test-secret'),
  generate: jest.fn(() => '123456'),
  generateURI: jest.fn(() => 'otpauth://totp/test'),
  verify: jest.fn(() => ({
    valid: true,
    delta: 0,
  })),
}));

interface TestUser {
  email: string;
  username: string;
  password: string;
}

interface AuthenticatedTestUser {
  id: number;
  token: string;
}

interface RegisterResponse {
  userId: number;
}

interface LoginResponse {
  access_token: string;
}

interface FriendshipResponse {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: string;
}

describe('Friends (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const userA: TestUser = {
    email: 'friend-a@example.com',
    username: 'friend_a',
    password: 'StrongPassword123!',
  };

  const userB: TestUser = {
    email: 'friend-b@example.com',
    username: 'friend_b',
    password: 'StrongPassword123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    await app.init();

    server = app.getHttpServer() as Server;
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  async function createAuthenticatedUser(
    user: TestUser,
  ): Promise<AuthenticatedTestUser> {
    const registerResponse = await request(server)
      .post('/auth/register')
      .send(user)
      .expect(201);

    const registerBody = registerResponse.body as RegisterResponse;

    const loginResponse = await request(server)
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200);

    const loginBody = loginResponse.body as LoginResponse;

    return {
      id: registerBody.userId,
      token: loginBody.access_token,
    };
  }

  describe('POST /friends/requests', () => {
    it('should reject unauthenticated friend requests', async () => {
      const b = await createAuthenticatedUser(userB);

      await request(server)
        .post('/friends/requests')
        .send({
          addresseeId: b.id,
        })
        .expect(401);
    });

    it('should reject sending a friend request to yourself', async () => {
      const a = await createAuthenticatedUser(userA);

      await request(server)
        .post('/friends/requests')
        .set('Authorization', `Bearer ${a.token}`)
        .send({
          addresseeId: a.id,
        })
        .expect(400);
    });

    it('should reject duplicate friend requests', async () => {
      const a = await createAuthenticatedUser(userA);
      const b = await createAuthenticatedUser(userB);

      await request(server)
        .post('/friends/requests')
        .set('Authorization', `Bearer ${a.token}`)
        .send({
          addresseeId: b.id,
        })
        .expect(201);

      await request(server)
        .post('/friends/requests')
        .set('Authorization', `Bearer ${a.token}`)
        .send({
          addresseeId: b.id,
        })
        .expect(400);
    });
  });

  describe('friend request lifecycle', () => {
    it('should send, accept and list a friend', async () => {
      const a = await createAuthenticatedUser(userA);
      const b = await createAuthenticatedUser(userB);

      const requestResponse = await request(server)
        .post('/friends/requests')
        .set('Authorization', `Bearer ${a.token}`)
        .send({
          addresseeId: b.id,
        })
        .expect(201);

      const requestBody = requestResponse.body as FriendshipResponse;

      expect(requestBody).toMatchObject({
        requesterId: a.id,
        addresseeId: b.id,
        status: 'PENDING',
      });

      const friendshipId = requestBody.id;

      const pendingResponse = await request(server)
        .get('/friends/requests')
        .set('Authorization', `Bearer ${b.token}`)
        .expect(200);

      expect(pendingResponse.body).toHaveLength(1);

      expect(pendingResponse.body).toEqual([
        expect.objectContaining({
          id: friendshipId,
          requesterId: a.id,
          addresseeId: b.id,
          status: 'PENDING',
          requester: expect.objectContaining({
            id: a.id,
            username: userA.username,
            email: userA.email,
          }),
        }),
      ]);

      const acceptResponse = await request(server)
        .post(`/friends/requests/${friendshipId}/accept`)
        .set('Authorization', `Bearer ${b.token}`)
        .expect(201);

      expect(acceptResponse.body).toMatchObject({
        id: friendshipId,
        requesterId: a.id,
        addresseeId: b.id,
        status: 'ACCEPTED',
      });

      const friendsResponse = await request(server)
        .get('/friends')
        .set('Authorization', `Bearer ${a.token}`)
        .expect(200);

      expect(friendsResponse.body).toEqual([
        expect.objectContaining({
          id: b.id,
          username: userB.username,
          email: userB.email,
        }),
      ]);

      const conversations = await prisma.conversation.findMany({
        where: {
          type: 'DIRECT',
        },
        include: {
          members: true,
        },
      });

      expect(conversations).toHaveLength(1);

      expect(
        conversations[0]?.members.map((member) => member.userId).sort(),
      ).toEqual([a.id, b.id].sort());
    });

    it('should not allow the requester to accept their own request', async () => {
      const a = await createAuthenticatedUser(userA);
      const b = await createAuthenticatedUser(userB);

      const response = await request(server)
        .post('/friends/requests')
        .set('Authorization', `Bearer ${a.token}`)
        .send({
          addresseeId: b.id,
        })
        .expect(201);

      const body = response.body as FriendshipResponse;

      await request(server)
        .post(`/friends/requests/${body.id}/accept`)
        .set('Authorization', `Bearer ${a.token}`)
        .expect(403);
    });
  });

  describe('DELETE /friends/:userId', () => {
    it('should remove an accepted friend', async () => {
      const a = await createAuthenticatedUser(userA);
      const b = await createAuthenticatedUser(userB);

      const requestResponse = await request(server)
        .post('/friends/requests')
        .set('Authorization', `Bearer ${a.token}`)
        .send({
          addresseeId: b.id,
        })
        .expect(201);

      const requestBody = requestResponse.body as FriendshipResponse;

      await request(server)
        .post(`/friends/requests/${requestBody.id}/accept`)
        .set('Authorization', `Bearer ${b.token}`)
        .expect(201);

      await request(server)
        .delete(`/friends/${b.id}`)
        .set('Authorization', `Bearer ${a.token}`)
        .expect(200);

      const friendsResponse = await request(server)
        .get('/friends')
        .set('Authorization', `Bearer ${a.token}`)
        .expect(200);

      expect(friendsResponse.body).toEqual([]);
    });
  });
});