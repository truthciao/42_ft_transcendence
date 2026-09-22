import { PrismaService } from '../../prisma/prisma.service.js';
import { UsersService } from './users.service.js';
import { jest } from '@jest/globals';
import { FilesService } from '../files/files.service.js';
import { UserRole } from '../../generated/prisma/enums.js';

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
type UserIdResult = {
  id: number;
};
type FindManyResult = UserWithProfile[];
type FindUniqueResult = UserWithProfile | UserWithPassword | null;
type CreateResult = UserWithProfile;

type PrismaMock = {
  user: {
    findMany: jest.MockedFunction<() => Promise<FindManyResult>>;
    findUnique: jest.MockedFunction<
      () => Promise<FindUniqueResult | UserIdResult>
    >;
    create: jest.MockedFunction<() => Promise<CreateResult>>;
    update: jest.MockedFunction<() => Promise<unknown>>;
  };
  workspace: {
    findFirst: jest.MockedFunction<() => Promise<unknown>>;
  };

  profile: {
    findUnique: jest.MockedFunction<() => Promise<unknown>>;
  };
  $transaction: jest.MockedFunction<
    (callback: (tx: TransactionMock) => Promise<unknown>) => Promise<unknown>
  >;
};

type TransactionMock = {
  workspaceInvite: {
    deleteMany: jest.Mock;
  };
  conversationMember: {
    deleteMany: jest.Mock;
  };
  workspaceMember: {
    deleteMany: jest.Mock;
  };
  attachment: {
    deleteMany: jest.Mock;
  };
  user: {
    delete: jest.Mock;
  };
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaMock;
  let filesService: jest.Mocked<FilesService>;
  let transaction: TransactionMock;

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      workspace: {
        findFirst: jest.fn(),
      },

      profile: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(
        async (callback: (tx: TransactionMock) => Promise<unknown>) =>
          callback(transaction),
      ),
    };

    filesService = {
      getFileUrlsByUser: jest.fn(),
      deletePhysicalFiles: jest.fn(),
      deletePhysicalFile: jest.fn(),
    } as unknown as jest.Mocked<FilesService>;

    service = new UsersService(
      prisma as unknown as PrismaService,
      filesService,
    );

    transaction = {
      workspaceInvite: {
        deleteMany: jest.fn(),
      },
      conversationMember: {
        deleteMany: jest.fn(),
      },
      workspaceMember: {
        deleteMany: jest.fn(),
      },
      attachment: {
        deleteMany: jest.fn(),
      },
      user: {
        delete: jest.fn(),
      },
    };
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

  it('finds all users for admin', async () => {
    const users = [
      {
        id: 1,
        email: 'test@example.com',
        username: 'test',
        role: UserRole.USER,
        createdAt: new Date('2026-01-01'),
        profile: {
          avatarUrl: '/uploads/avatars/test.jpg',
          displayName: 'Test User',
          bio: 'Hello',
        },
      },
    ];

    prisma.user.findMany.mockResolvedValueOnce(users);

    await expect(service.findAllForAdmin()).resolves.toEqual([
      {
        id: 1,
        email: 'test@example.com',
        username: 'test',
        role: UserRole.USER,
        createdAt: new Date('2026-01-01'),
        avatarUrl: '/uploads/avatars/test.jpg',
        displayName: 'Test User',
        bio: 'Hello',
      },
    ]);
  });

  it('finds all users for admin without profile', async () => {
    const users = [
      {
        id: 2,
        email: 'test2@example.com',
        username: 'test2',
        role: UserRole.USER,
        createdAt: new Date('2026-01-02'),
        profile: null,
      },
    ];

    prisma.user.findMany.mockResolvedValueOnce(users);

    await expect(service.findAllForAdmin()).resolves.toEqual([
      {
        id: 2,
        email: 'test2@example.com',
        username: 'test2',
        role: UserRole.USER,
        createdAt: new Date('2026-01-02'),
        avatarUrl: null,
        displayName: null,
        bio: null,
      },
    ]);
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

  it('updates a user role', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 2 });

    prisma.user.update.mockResolvedValueOnce({
      id: 2,
      email: 'test2@example.com',
      username: 'test2',
      role: UserRole.ADMIN,
    });

    await expect(
      service.updateUserRole(2, UserRole.ADMIN, 1),
    ).resolves.toEqual({
      id: 2,
      email: 'test2@example.com',
      username: 'test2',
      role: UserRole.ADMIN,
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { role: UserRole.ADMIN },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });
  });

  it('rejects self-demotion', async () => {
    await expect(
      service.updateUserRole(1, UserRole.USER, 1),
    ).rejects.toThrow('You cannot demote yourself');

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects updating a non-existent user role', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.updateUserRole(999999, UserRole.ADMIN, 1),
    ).rejects.toThrow('User not found');

    expect(prisma.user.update).not.toHaveBeenCalled();
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

  it('deletes a user successfully', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 2 });
    prisma.workspace.findFirst.mockResolvedValueOnce(null);
    prisma.profile.findUnique.mockResolvedValueOnce({
      avatarUrl: '/uploads/avatars/avatar.jpg',
    });

    filesService.getFileUrlsByUser.mockResolvedValueOnce([
      { fileUrl: '/uploads/files/document.pdf' },
    ]);

    await expect(service.deleteUser(2, 1)).resolves.toEqual({
      message: 'User deleted successfully',
    });

    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(prisma.workspace.findFirst).toHaveBeenCalledWith({
      where: { ownerId: 2 },
      select: { id: true },
    });
    expect(prisma.profile.findUnique).toHaveBeenCalledWith({
      where: { userId: 2 },
      select: { avatarUrl: true },
    });

    expect(transaction.workspaceInvite.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [{ inviterId: 2 }, { inviteeId: 2 }],
      },
    });

    expect(transaction.conversationMember.deleteMany).toHaveBeenCalledWith({
      where: { userId: 2 },
    });

    expect(transaction.workspaceMember.deleteMany).toHaveBeenCalledWith({
      where: { userId: 2 },
    });

    expect(transaction.attachment.deleteMany).toHaveBeenCalledWith({
      where: { uploaderId: 2 },
    });

    expect(transaction.user.delete).toHaveBeenCalledWith({
      where: { id: 2 },
    });

    expect(filesService.deletePhysicalFiles).toHaveBeenCalledWith([
      '/uploads/files/document.pdf',
    ]);

    expect(filesService.deletePhysicalFile).toHaveBeenCalledWith(
      '/uploads/avatars/avatar.jpg',
    );
  });

  it('rejects self-deletion', async () => {
    await expect(service.deleteUser(1, 1)).rejects.toThrow(
      'You cannot delete yourself',
    );

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(filesService.getFileUrlsByUser).not.toHaveBeenCalled();
  });

  it('rejects deleting a non-existent user', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.deleteUser(999999, 1)).rejects.toThrow(
      'User not found',
    );

    expect(prisma.workspace.findFirst).not.toHaveBeenCalled();
    expect(filesService.getFileUrlsByUser).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects deleting a workspace owner', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 2 });
    prisma.workspace.findFirst.mockResolvedValueOnce({ id: 10 });

    await expect(service.deleteUser(2, 1)).rejects.toThrow(
      'Transfer workspace ownership before deleting this user',
    );

    expect(filesService.getFileUrlsByUser).not.toHaveBeenCalled();
    expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
