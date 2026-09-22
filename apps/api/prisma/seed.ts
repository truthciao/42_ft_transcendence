import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../src/generated/prisma/enums.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

const TEST_USER_COUNT = 10_000;
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
const SEED_ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME;
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

async function ensureAdminUser() {
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_USERNAME || !SEED_ADMIN_PASSWORD) {
    throw new Error(
      'SEED_ADMIN_EMAIL, SEED_ADMIN_USERNAME and SEED_ADMIN_PASSWORD are required',
    );
  }

  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: {
      email: SEED_ADMIN_EMAIL,
    },
    update: {
      role: UserRole.ADMIN,
    },
    create: {
      email: SEED_ADMIN_EMAIL,
      username: SEED_ADMIN_USERNAME,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Bootstrap admin ready: ${admin.email}`);
}

async function main() {
  await ensureAdminUser();

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
