import type { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { ALLOWED_ORIGINS } from './config/cors.config.js';

export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(new ZodValidationPipe());

  app.enableCors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-User-Id', 'Authorization'],
  });
}
