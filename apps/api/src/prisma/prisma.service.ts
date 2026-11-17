import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { getDatabaseUrl } from '../config/database.config.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
constructor() {
  console.log('[PrismaService] constructor called');

  const databaseUrl = getDatabaseUrl('app');
  const parsedUrl = new URL(databaseUrl);

  console.log('[Database config]', {
    cwd: process.cwd(),
    username: parsedUrl.username,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    database: parsedUrl.pathname,
    passwordLength: decodeURIComponent(parsedUrl.password).length,
    envPasswordExists: Boolean(process.env.TRANSCENDENCE_APP_PASSWORD),
    matchesRuntimeEnv:
      decodeURIComponent(parsedUrl.password) ===
      process.env.TRANSCENDENCE_APP_PASSWORD,
  });

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  super({ adapter });
}

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}