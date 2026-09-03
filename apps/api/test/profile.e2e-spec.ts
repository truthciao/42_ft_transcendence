import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';

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

describe('Profiles (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const testUser = {
    email: 'profile-e2e@example.com',
    username: 'profile_e2e_user',
    password: 'StrongPassword123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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

  describe('GET /profiles/me', () => {
    it('should reject unauthenticated requests', async () => {
      await request(server).get('/profiles/me').expect(401);
    });

    it('should return the current user profile', async () => {
      const token = await registerAndLogin(server, testUser);

      const response = await request(server)
        .get('/profiles/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        user: {
          email: testUser.email,
          username: testUser.username,
        },
      });
    });
  });

  describe('PATCH /profiles/me', () => {
    it('should update the current user profile', async () => {
      const token = await registerAndLogin(server, testUser);

      const updatePayload = {
        displayName: 'E2E User',
        bio: 'Profile E2E test',
        preferredLanguage: 'en',
      };

      await request(server)
        .patch('/profiles/me')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload)
        .expect(200);

      const response = await request(server)
        .get('/profiles/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject(updatePayload);
    });

    it('should reject unauthenticated updates', async () => {
      await request(server)
        .patch('/profiles/me')
        .send({
          displayName: 'Should fail',
        })
        .expect(401);
    });

    it('should reject an invalid profile payload', async () => {
      const token = await registerAndLogin(server, testUser);

      await request(server)
        .patch('/profiles/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          displayName: 12345,
        })
        .expect(400);
    });
  });
});
