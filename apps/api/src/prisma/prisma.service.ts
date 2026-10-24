
import { readFileSync } from 'node:fs';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

function getDatabaseUrl(): string {
  const secretFile = process.env.DATABASE_URL_SECRET_FILE;

  // Docker: prioritize the mounted secret file
  if (secretFile) {
    const databaseUrl = readFileSync(secretFile, 'utf8').trim();

    if (!databaseUrl) {
      throw new Error('Database connection configuration is empty');
    }

    return databaseUrl;
  }

  // CI / local development: use DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    return databaseUrl;
  }

  throw new Error(
    'Neither DATABASE_URL_SECRET_FILE nor DATABASE_URL is defined',
  );
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: getDatabaseUrl(),
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
