import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import type { CreateUserPayload } from '@repo/shared-types';
import { UserRole } from '../../generated/prisma/enums.js';
import { FilesService } from '../files/files.service.js';

type CreateUserData = CreateUserPayload & {
  passwordHash?: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  async createUser(data: CreateUserData) {
    //Check if passwordHash is avaiable!
    let hash = data.passwordHash;
    if (!hash) {
      const defaultPasswordHash = 'DefaultPassword123!';
      hash = await bcrypt.hash(defaultPasswordHash, 10);
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash: hash,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        email: true,
        username: true,
        profile: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        profile: true,
        twoFactorSecret: true,
        isTwoFactorEnabled: true,
      },
    });
  }

  async findPublicProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        profile: {
          select: {
            avatarUrl: true,
            displayName: true,
            bio: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.profile?.avatarUrl ?? null,
      displayName: user.profile?.displayName ?? null,
      bio: user.profile?.bio ?? null,
    };
  }

  async findCurrentUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isTwoFactorEnabled: true,
        profile: {
          select: {
            avatarUrl: true,
            preferredLanguage: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      avatarUrl: user.profile?.avatarUrl ?? null,
      preferredLanguage: user.profile?.preferredLanguage ?? null,
    };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        profile: true,
        twoFactorSecret: true,
        isTwoFactorEnabled: true,
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        profile: true,
        twoFactorSecret: true,
        isTwoFactorEnabled: true,
      },
    });
  }

  async findAllForAdmin() {
    const users = await this.prisma.user.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            avatarUrl: true,
            displayName: true,
            bio: true,
          },
        },
      },
    });

    return users.map(({ profile, ...user }) => ({
      ...user,
      avatarUrl: profile?.avatarUrl ?? null,
      displayName: profile?.displayName ?? null,
      bio: profile?.bio ?? null,
    }));
  }

  async updateUserRole(
    userId: number,
    role: UserRole,
    currentUserId: number,
  ) {
    if (userId === currentUserId && role === UserRole.USER) {
      throw new BadRequestException('You cannot demote yourself');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });
  }

  async deleteUser(userId: number, currentUserId: number) {
    if (userId === currentUserId) {
      throw new BadRequestException('You cannot delete yourself');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ownedWorkspace = await this.prisma.workspace.findFirst({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (ownedWorkspace) {
      throw new BadRequestException(
        'Transfer workspace ownership before deleting this user',
      );
    }

    const attachments = await this.filesService.getFileUrlsByUser(userId);

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { avatarUrl: true },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.workspaceInvite.deleteMany({
        where: {
          OR: [{ inviterId: userId }, { inviteeId: userId }],
        },
      });

      await tx.conversationMember.deleteMany({
        where: { userId },
      });

      await tx.workspaceMember.deleteMany({
        where: { userId },
      });

      await tx.attachment.deleteMany({
        where: { uploaderId: userId },
      });

      await tx.user.delete({
        where: { id: userId },
      });
    });

    this.filesService.deletePhysicalFiles(
      attachments.map((attachment) => attachment.fileUrl),
    );
    this.filesService.deletePhysicalFile(profile?.avatarUrl ?? null);

    return { message: 'User deleted successfully' };
  }

  async updateTwoFactorSecret(userId: number, secret: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });
  }

  async enableTwoFactor(userId: number, isEnabled: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: isEnabled },
    });
  }

  async searchUsers(
    username: string,
    currentUserId: number,
    limit: number,
    offset: number,
  ) {
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: 'insensitive',
        },
        id: {
          not: currentUserId,
        },
      },

      select: {
        id: true,
        username: true,
        email: true,
      },

      orderBy: {
        id: 'asc',
      },

      take: limit + 1,
      skip: offset,
    });

    const hasMore = users.length > limit;

    return {
      users: users.slice(0, limit),
      hasMore,
    };
  }

  async getTestUsers() {
    return this.prisma.user.findMany({
      where: {
        username: {
          startsWith: 'virtual-user-',
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }
}
