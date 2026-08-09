import { ZodValidationPipe } from 'nestjs-zod';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ALLOWED_ORIGINS } from './config/cors.config.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ZodValidationPipe());

  app.enableCors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-User-Id', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
