
import { readFileSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

function getDatabaseUrl(): string {
  const secretFile = process.env.DATABASE_URL_SECRET_FILE;

  // Docker environment: read connection string from secret file
  if (secretFile) {
    const databaseUrl = readFileSync(secretFile, 'utf8').trim();

    if (!databaseUrl) {
      throw new Error('Database connection configuration is empty');
    }

    return databaseUrl;
  }

  // CI / local environment: use DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    return databaseUrl;
  }

  throw new Error(
    'Neither DATABASE_URL_SECRET_FILE nor DATABASE_URL is defined',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },

  datasource: {
    url: getDatabaseUrl(),
  },
});
