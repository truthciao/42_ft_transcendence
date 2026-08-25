import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  ConversationType,
  WorkspaceInviteStatus,
  WorkspaceMember,
  WorkspaceRole,
} from '../../generated/prisma/client.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';
import { CreateChannelDto } from './dto/create-channel.dto.js';
import { randomBytes } from 'crypto';
import { atLeast } from './constants/role-rank.js';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    ownerId: number,
    dto: { name: string; description?: string; icon?: string }
  ) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: WorkspaceRole.OWNER,
          },
        },
        channels: {
          create: {
            type: ConversationType.CHANNEL,
            name: 'general',
            isDefault: true,
            createdById: ownerId,
            members: { create: { userId: ownerId } },
          },
        },
      },
      include: {
        members: true,
        channels: true,
      },
    });

    return {
      ...workspace,
      myMembership: workspace.members?.find((m) => m.userId === ownerId) ?? null,
    }
  }

  async findAllForUser(userId: number) {
    const workspaces = await this.prisma.workspace.findMany({
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

    return workspaces.map((workspace) => ({
      ...workspace,
      myMembership: workspace.members.find((m) => m.userId === userId) ?? null,
    }))
  }

  async listIncomingInvites(userId: number) {
    return this.prisma.workspaceInvite.findMany({
      where: {
        inviteeId: userId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        workspace: { select: { id: true, name: true } },
        inviter: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  async getInviteForInvitee(inviteId: number, userId: number) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { id: inviteId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            _count: { select: { members: true } },
          },
        },
        inviter: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!invite) throw new NotFoundException('Invite not found');

    if (invite.inviteeId !== userId)
      throw new ForbiddenException('This invite is not for you');

    return invite;
  }

  async getInviteByToken(token: string, userId: number) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            _count: { select: { members: true } },
          },
        },
        inviter: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!invite) throw new NotFoundException('Invite not found');

    if (invite.inviteeId !== userId)
      throw new ForbiddenException('This invite is not for you');

    return invite;
  }

  async findOne(workspaceId: number, membership?: WorkspaceMember) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return { ...workspace, myMembership: membership ?? null };
  }

  async listMembers(id: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          orderBy: { joinedAt: 'asc' },
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                username: true,
                profile: { select: { displayName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    return workspace?.members ?? [];
  }

  async update(
    workspaceId: number,
    dto: { name?: string; description?: string; icon?: string }
  ) {
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
      },
      include: { members: true },
    });
  }

  async remove(workspaceId: number) {
    return this.prisma.workspace.delete({
      where: { id: workspaceId },
    });
  }

  async createInvite(
    workspaceId: number,
    actor: WorkspaceMember,
    dto: InviteMemberDto,
  ) {
    if (dto.role as WorkspaceRole === WorkspaceRole.OWNER) {
      throw new BadRequestException('Use transfer-ownership instead');
    }
    if (dto.role === WorkspaceRole.ADMIN && actor.role !== WorkspaceRole.OWNER)
      throw new ForbiddenException('Only the owner can invite admins');
    if (!dto.userId && !dto.email)
      throw new BadRequestException('Either userId or email is required');

    if (dto.userId) {
      const target = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });
      if (!target) {
        throw new NotFoundException('User to invite not found');
      }

      const already = await this.prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: dto.userId } },
      });
      if (already) throw new ConflictException('User is already a member');

      const pending = await this.prisma.workspaceInvite.findFirst({
        where: { workspaceId, inviteeId: dto.userId, status: 'PENDING' },
      });
      if (pending) throw new ConflictException('An invite is already pending');
    }

    return this.prisma.workspaceInvite.create({
      data: {
        workspaceId,
        inviterId: actor.userId,
        inviteeId: dto.userId ?? null,
        email: dto.email ?? null,
        role: dto.role ?? WorkspaceRole.MEMBER,
        token: randomBytes(24).toString('base64url'),
        expiresAt: new Date(Date.now() + 7 * 864e5),
        status: WorkspaceInviteStatus.PENDING,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            _count: { select: { members: true } },
          },
        },
        inviter: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        invitee: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  async listWorkspaceInvites(workspaceId: number) {
    return this.prisma.workspaceInvite.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        respondedAt: true,
        invitee: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
        inviter: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });
  }

  async acceptInvite(inviteId: number, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const invite = await tx.workspaceInvite.findUnique({
        where: { id: inviteId },
      });
      if (!invite || invite.inviteeId !== userId) {
        throw new NotFoundException('Invite not found');
      }
      if (invite.status !== 'PENDING') {
        throw new ConflictException(
          `Invite already ${invite.status.toLocaleLowerCase()}`,
        );
      }
      if (invite.expiresAt < new Date()) {
        await tx.workspaceInvite.update({
          where: { id: inviteId },
          data: { status: 'REVOKED', respondedAt: new Date() },
        });
        throw new BadRequestException('Invite has expired');
      }

      await tx.workspaceMember.create({
        data: { workspaceId: invite.workspaceId, userId, role: invite.role },
      });

      const channels = await tx.conversation.findMany({
        where: { workspaceId: invite.workspaceId, type: 'CHANNEL' },
        select: { id: true, isDefault: true },
        orderBy: { isDefault: 'desc' },
      });
      if (channels.length) {
        await tx.conversationMember.createMany({
          data: channels.map((c) => ({ conversationId: c.id, userId })),
          skipDuplicates: true,
        });
      }

      await tx.workspaceInvite.update({
        where: { id: inviteId },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      });

      return {
        workspaceId: invite.workspaceId,
      };
    });
  }

  async rejectInvite(inviteId: number, userId: number) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { id: inviteId },
    });
    if (!invite || invite.inviteeId !== userId) {
      throw new NotFoundException('Invite not found');
    }
    if (invite.status !== 'PENDING') {
      throw new ConflictException(
        `Invite already ${invite.status.toLocaleLowerCase()}`,
      );
    }
    if (invite.expiresAt < new Date()) {
      await this.prisma.workspaceInvite.update({
        where: { id: inviteId },
        data: { status: 'REVOKED', respondedAt: new Date() },
      });
      throw new BadRequestException('Invite has expired');
    }

    return this.prisma.workspaceInvite.update({
      where: { id: inviteId },
      data: { status: 'REJECTED', respondedAt: new Date() },
    });
  }

  async changeMemberRole(
    workspaceId: number,
    targetUserId: number,
    role: WorkspaceRole,
  ) {
    if (role === WorkspaceRole.OWNER)
      throw new BadRequestException(
        'Use transfer-ownership to change the owner',
      );
    const target = await this.getMembershipOrThrow(workspaceId, targetUserId);
    if (target.role === 'OWNER') {
      throw new BadRequestException('Cannot demote the owner directly');
    }
    if (target.role === role) return target;

    return this.prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      data: { role },
    });
  }

  async removeMember(
    workspaceId: number,
    targetUserId: number,
    actor: WorkspaceMember,
  ) {
    if (targetUserId === actor.userId)
      throw new BadRequestException(
        'Use the leave endpoint to remove yourself',
      );
    const target = await this.getMembershipOrThrow(workspaceId, targetUserId);
    if (target.role === WorkspaceRole.OWNER)
      throw new ForbiddenException('The owner cannot be removed');

    if (
      actor.role != WorkspaceRole.OWNER &&
      !atLeast(actor.role, target.role, true)
    ) {
      throw new ForbiddenException('Admin can only remove members');
    }

    return this.prisma.$transaction(async (tx) => {
      const channels = await tx.conversation.findMany({
        where: { workspaceId, type: 'CHANNEL' },
        select: { id: true },
      });
      await tx.conversationMember.deleteMany({
        where: {
          userId: targetUserId,
          conversationId: { in: channels.map((c) => c.id) },
        },
      });
      return tx.workspaceMember.delete({
        where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      });
    });
  }

  async leave(workspaceId: number, m: WorkspaceMember) {
    if (m.role === WorkspaceRole.OWNER)
      throw new BadRequestException(
        'Transfer ownership before leaving, or delete the workspace',
      );

    return this.prisma.$transaction(async (tx) => {
      const channels = await tx.conversation.findMany({
        where: { workspaceId, type: 'CHANNEL' },
        select: { id: true },
      });
      await tx.conversationMember.deleteMany({
        where: {
          userId: m.userId,
          conversationId: { in: channels.map((c) => c.id) },
        },
      });
      return tx.workspaceMember.delete({
        where: { workspaceId_userId: { workspaceId, userId: m.userId } },
      });
    });
  }

  async transferOwnership(
    workspaceId: number,
    currentOwnerId: number,
    targetUserId: number,
  ) {
    if (currentOwnerId === targetUserId)
      throw new BadRequestException('Already the owner');
    await this.getMembershipOrThrow(workspaceId, targetUserId);

    return this.prisma.$transaction([
      this.prisma.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId: currentOwnerId } },
        data: { role: WorkspaceRole.ADMIN },
      }),
      this.prisma.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
        data: { role: WorkspaceRole.OWNER },
      }),
      this.prisma.workspace.update({
        where: { id: workspaceId },
        data: { ownerId: targetUserId },
      }),
    ]);
  }

  // ---- channel ----

  async createChannel(
    workspaceId: number,
    userId: number,
    dto: CreateChannelDto,
  ) {
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true },
    });

    const nameTaken = await this.prisma.conversation.findFirst({
      where: { workspaceId, type: 'CHANNEL', name: dto.name },
    });
    if (nameTaken) throw new ConflictException('Channel name already exists');

    return this.prisma.conversation.create({
      data: {
        workspaceId,
        type: 'CHANNEL',
        name: dto.name,
        createdById: userId,
        members: {
          create: members.map((m) => ({ userId: m.userId })),
        },
      },
      include: { members: true },
    });
  }

  async listChannels(workspaceId: number, userId: number) {
    return this.prisma.conversation.findMany({
      where: { workspaceId, type: 'CHANNEL' },
      orderBy: { isDefault: 'desc' },
      include: {
        _count: { select: { members: true } },
        members: { where: { userId }, select: { id: true } },
      },
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
}
