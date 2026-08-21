import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

jest.mock('otplib', () => ({
  generateSecret: jest.fn(() => 'test-secret'),
  generate: jest.fn(() => '123456'),
  generateURI: jest.fn(() => 'otpauth://totp/test'),
  verify: jest.fn(() => ({
    valid: true,
    delta: 0,
  })),
}));

describe('Health (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    await app.init();

    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health/live', () => {
    it('should report that the API process is alive', async () => {
      const response = await request(server).get('/health/live').expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        service: 'api',
        timestamp: expect.any(String),
      });

      expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
    });
  });

  describe('GET /health/ready', () => {
    it('should report that the API and database are ready', async () => {
      const response = await request(server).get('/health/ready').expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        checks: {
          database: {
            status: 'up',
          },
        },
        timestamp: expect.any(String),
      });

      expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
    });
  });
});
