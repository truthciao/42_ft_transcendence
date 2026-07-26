import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async getProfile() {
    const existingUser = await this.prisma.user.findFirst({
      where: { id: 1 },
    });

    if (existingUser) {
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        id: 1,
        username: 'user-1',
        email: `user_${Date.now()}@temp.com`, //Added for OAuth (temporary)
      },
    });
  }

  async updateProfile(dto: UpdateProfileDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { id: 1 },
    });

    if (!existingUser) {
      return this.prisma.user.create({
        data: {
          id: 1,
          username: dto.username ?? 'user-1',
          email: `user_${Date.now()}@temp.com`, //Added for OAuth (temporary)
          displayName: dto.displayName,
          bio: dto.bio,
          avatarUrl: dto.avatarUrl,
        },
      });
    }

    return this.prisma.user.update({
      where: { id: 1 },
      data: {
        username: dto.username ?? existingUser.username,
        displayName: dto.displayName ?? existingUser.displayName,
        bio: dto.bio ?? existingUser.bio,
        avatarUrl: dto.avatarUrl ?? existingUser.avatarUrl,
      },
    });
  }
}