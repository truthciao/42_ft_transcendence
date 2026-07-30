import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkspaceRole } from '../../generated/prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: number, name: string) {
    return this.prisma.workspace.create({
      data: {
        name,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async findAllForUser(userId: number) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { id: 'asc' },
      include: {
        members: true,
      },
    });
  }

  async findOne(workspaceId: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async update(workspaceId: number, dto: { name?: string }) {
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(dto.name != undefined && { name: dto.name }),
      },
      include: { members: true },
    });
  }

  async remove(worksapceId: number) {
    return this.prisma.workspace.delete({
      where: { id: worksapceId },
    });
  }

  async inviteMember(workspaceId: number, userId: number) {
    const existing = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (existing) {
      throw new BadRequestException(
        'User is already a member of this workspace',
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      throw new NotFoundException('User to invite not found');
    }

    return this.prisma.workspaceMember.create({
      data: { workspaceId, userId, role: WorkspaceRole.MEMBER },
    });
  }

  async removeMember(workspaceId: number, targetUserId: number) {
    const membership = await this.getMembershipOrThrow(
      workspaceId,
      targetUserId,
    );

    if (membership.role === WorkspaceRole.OWNER) {
      await this.assertNotSoleOwner(workspaceId);
    }

    return this.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    });
  }

  async leave(workspaceId: number, userId: number, role: WorkspaceRole) {
    if (role === WorkspaceRole.OWNER)
      await this.assertNotSoleOwner(workspaceId);

    return this.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }

  private async getMembershipOrThrow(workspaceId: number, userId: number) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!membership) {
      throw new NotFoundException('This user is not a member of the workspace');
    }
    return membership;
  }

  private async assertNotSoleOwner(workspaceId: number) {
    const ownerCount = await this.prisma.workspaceMember.count({
      where: { workspaceId, role: WorkspaceRole.OWNER },
    });

    if (ownerCount <= 1) {
      throw new BadRequestException(
        'You are the only owner of this workspace. Transfer ownership to someone else or delete the workspace instead.',
      );
    }
  }
}
