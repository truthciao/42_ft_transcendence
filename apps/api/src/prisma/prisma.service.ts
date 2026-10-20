import { readFileSync } from 'node:fs';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const secretFile = process.env.DATABASE_URL_SECRET_FILE;

    if (!secretFile) {
       throw new Error('DATABASE_URL_SECRET_FILE is not defined');
    }

    const connectionString = readFileSync(secretFile, 'utf8').trim();

     if (!connectionString) {
        throw new Error('Database connection configuration is empty');
    }

    const adapter = new PrismaPg({
      connectionString,
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
