import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

interface CreateUserData {
  email: string;
  username: string;
  passwordHash?: string; //Optional to skip dto check!
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findCurrentUser(id: number) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      isTwoFactorEnabled: true,
      profile: {
        select: {
          avatarUrl: true,
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
    isTwoFactorEnabled: user.isTwoFactorEnabled,
    avatarUrl: user.profile?.avatarUrl ?? null,
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

  async searchUsers(username: string, currentUserId: number) {
    return this.prisma.user.findMany({
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
      },
      take: 10,
    });
  }
}
