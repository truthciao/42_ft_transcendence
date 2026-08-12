import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';

import { PrismaService } from '../src/prisma/prisma.service.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
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

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;

  const testUser = {
    email: 'e2e-auth@example.com',
    username: 'e2e_auth_user',
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

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(server)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toEqual({
        message: 'User registered successfully',
        userId: expect.any(Number),
      });
    });

    it('should reject an invalid registration payload', async () => {
      await request(server)
        .post('/auth/register')
        .send({})
        .expect(400);
    });

    it('should reject a duplicate user', async () => {
      await request(server)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      await request(server)
        .post('/auth/register')
        .send(testUser)
        .expect(400);
    });
  });
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      await request(server)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const response = await request(server)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toEqual({
        access_token: expect.any(String),
        user: {
          id: expect.any(Number),
          email: testUser.email,
          username: testUser.username,
        },
      });
    });

    it('should reject an incorrect password', async () => {
      await request(server)
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      await request(server)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });
  });
});