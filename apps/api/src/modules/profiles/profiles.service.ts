import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(userId: number) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: {
        user: {
          connectOrCreate: {
            where: { id: userId },
            create: { id: userId, username: `user-${userId}` },
          },
        },
      },
      update: {},
    });
  }

  updateProfile(userId: number, dto: UpdateProfileDto) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: {
        ...dto,
        user: {
          connectOrCreate: {
            where: { id: userId },
            create: { id: userId, username: `user-${userId}` },
          },
        },
      },
      update: dto,
    });
  }

  findProfileByUserId(userId: number) {
    return this.prisma.profile.findUnique({ where: { userId } });
  }
}
