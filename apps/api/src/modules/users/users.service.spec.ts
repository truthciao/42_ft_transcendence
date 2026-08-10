import { PrismaService } from '../../prisma/prisma.service.js';
import { UsersService } from './users.service.js';
import { jest } from '@jest/globals';

type UserWithProfile = {
  id: number;
  email: string;
  username: string;
  profile: Record<string, unknown> | null;
};

type UserWithPassword = {
  id: number;
  email: string;
  username: string;
  passwordHash: string;
};

type FindManyResult = UserWithProfile[];
type FindUniqueResult = UserWithProfile | UserWithPassword | null;
type CreateResult = UserWithProfile;

type PrismaMock = {
  user: {
    findMany: jest.MockedFunction<() => Promise<FindManyResult>>;
    findUnique: jest.MockedFunction<() => Promise<FindUniqueResult>>;
    create: jest.MockedFunction<() => Promise<CreateResult>>;
  };
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaMock;

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new UsersService(prisma as unknown as PrismaService);
  });

  it('finds all users', async () => {
    const users: UserWithProfile[] = [
      {
        id: 1,
        email: 'test@example.com',
        username: 'test',
        profile: null,
      },
    ];

    prisma.user.findMany.mockResolvedValueOnce(users);

    await expect(service.findAll()).resolves.toEqual(users);
  });

  it('finds user by id', async () => {
    const user: UserWithProfile = {
      id: 1,
      email: 'test@example.com',
      username: 'test',
      profile: null,
    };

    prisma.user.findUnique.mockResolvedValueOnce(user);

    await expect(service.findById(1)).resolves.toEqual(user);
  });

  it('finds user by email', async () => {
    const user: UserWithPassword = {
      id: 1,
      email: 'test@example.com',
      username: 'test',
      passwordHash: 'hash',
    };

    prisma.user.findUnique.mockResolvedValueOnce(user);

    await expect(service.findByEmail('test@example.com')).resolves.toEqual(
      user,
    );
  });

  it('finds user by username', async () => {
    const user: UserWithPassword = {
      id: 1,
      email: 'test@example.com',
      username: 'test',
      passwordHash: 'hash',
    };

    prisma.user.findUnique.mockResolvedValueOnce(user);

    await expect(service.findByUsername('test')).resolves.toEqual(user);
  });

  it('creates user with profile', async () => {
    const user: UserWithProfile = {
      id: 1,
      email: 'test@example.com',
      username: 'test',
      profile: {},
    };

    prisma.user.create.mockResolvedValueOnce(user);

    await expect(
      service.createUser({
        email: 'test@example.com',
        username: 'test',
        passwordHash: 'hash',
      }),
    ).resolves.toEqual(user);
  });
});
