import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkspaceRole } from '../../generated/prisma/client';
import { NotFoundError } from 'rxjs';

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

  async findOne(workspaceId: number, userId: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isMember = workspace.members.some(
      (member) => member.userId === userId,
    );
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return workspace;
  }

  async update(workspaceId: number, userId: number, dto: { name?: string }) {
    await this.assertIsOwner(workspaceId, userId);

    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(dto.name != undefined && { name: dto.name }),
      },
      include: { members: true },
    });
  }

  async remove(worksapceId: number, userId: number) {
    await this.assertIsOwner(worksapceId, userId);

    return this.prisma.workspace.delete({
      where: { id: worksapceId },
    });
  }

  private async assertIsOwner(workspaceId: number, userId: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const membership = workspace.members.find(
      (member) => member.userId === userId,
    );
    if (!membership || membership.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException(
        'Only the workspace owner can perform this action',
      );
    }

    return workspace;
  }
}
