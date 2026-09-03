import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

const TEST_USER_COUNT = 10_000;

async function main() {
  const users = Array.from({ length: TEST_USER_COUNT }, (_, index) => ({
    username: `virtual-user-${index + 1}`,
    email: `virtual-user-${index + 1}@example.com`,
  }));

  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`Created ${result.count} test users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
