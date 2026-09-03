import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  ConversationType,
  NotificationType,
  WorkspaceInviteStatus,
  WorkspaceMember,
  WorkspaceRole,
} from '../../generated/prisma/client.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';
import { CreateChannelDto } from './dto/create-channel.dto.js';
import { randomBytes } from 'crypto';
import { atLeast } from './constants/role-rank.js';
import { RealtimeRoomService } from '../realtime/services/realtime-room.service.js';
import { REALTIME_EVENTS } from '../realtime/realtime.constants.js';
import { MailService } from '../mail/mail.service.js';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeRoomService: RealtimeRoomService,
    private readonly mailService: MailService,
  ) {}

  async create(
    ownerId: number,
    dto: { name: string; description?: string; icon?: string },
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
      myMembership:
        workspace.members?.find((m) => m.userId === ownerId) ?? null,
    };
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
    }));
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
    dto: { name?: string; description?: string; icon?: string },
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
    if ((dto.role as WorkspaceRole) === WorkspaceRole.OWNER) {
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

    const invite = await this.prisma.workspaceInvite.create({
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

    if (invite.inviteeId) {
      try {
        const shouldSendInApp =
          await this.prisma.notificationPreference.findUnique({
            where: {
              userId_type: {
                userId: invite.inviteeId,
                type: NotificationType.WORKSPACE_INVITE_RECEIVED,
              },
            },
          });

        if (shouldSendInApp?.viaInApp !== false) {
          await this.prisma.notification.create({
            data: {
              recipientId: invite.inviteeId,
              actorId: actor.userId,
              type: NotificationType.WORKSPACE_INVITE_RECEIVED,
              workspaceId,
            },
          });
        }

        this.realtimeRoomService.emitToUser(
          invite.inviteeId,
          REALTIME_EVENTS.WORKSPACE_INVITE_RECEIVED,
          {
            workspaceId,
            inviteId: invite.id,
          },
        );

        this.sendWorkspaceInviteEmail(
          invite.inviteeId,
          actor.userId,
          workspaceId,
        ).catch((error) => {
          this.logger.error('Failed to send workspace invite email:', error);
        });
      } catch (error) {
        console.error(
          '[WorkspacesService] failed to notify invitee about invite: ',
          error,
        );
      }
    }

    return invite;
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
    const result = await this.prisma.$transaction(async (tx) => {
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
        inviterId: invite.inviterId,
      };
    });

    try {
      const shouldSendInApp =
        await this.prisma.notificationPreference.findUnique({
          where: {
            userId_type: {
              userId: result.inviterId,
              type: NotificationType.WORKSPACE_INVITE_ACCEPTED,
            },
          },
        });

      if (shouldSendInApp?.viaInApp !== false) {
        await this.prisma.notification.create({
          data: {
            recipientId: result.inviterId,
            actorId: userId,
            type: NotificationType.WORKSPACE_INVITE_ACCEPTED,
            workspaceId: result.workspaceId,
          },
        });
      }

      this.realtimeRoomService.emitToUser(
        result.inviterId,
        REALTIME_EVENTS.WORKSPACE_INVITE_ACCEPTED,
        {
          workspaceId: result.workspaceId,
          userId,
        },
      );

      this.sendWorkspaceInviteAcceptedEmail(
        result.inviterId,
        userId,
        result.workspaceId,
      ).catch((error) => {
        this.logger.error(
          'Failed to send workspace invite accepted email:',
          error,
        );
      });
    } catch (error) {
      console.error(
        '[WorkspaceService] Failed to notify inviter after accept:',
        error,
      );
    }

    return { workspaceId: result.workspaceId };
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
    actor: WorkspaceMember,
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

    const updated = await this.prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      data: { role },
    });

    try {
      const shouldSendInApp =
        await this.prisma.notificationPreference.findUnique({
          where: {
            userId_type: {
              userId: targetUserId,
              type: NotificationType.WORKSPACE_ROLE_CHANGED,
            },
          },
        });

      if (shouldSendInApp?.viaInApp !== false) {
        await this.prisma.notification.create({
          data: {
            recipientId: targetUserId,
            actorId: actor?.userId,
            type: NotificationType.WORKSPACE_ROLE_CHANGED,
            workspaceId,
          },
        });
      }

      this.realtimeRoomService.emitToUser(
        targetUserId,
        REALTIME_EVENTS.WORKSPACE_ROLE_CHANGED,
        { workspaceId, role },
      );

      this.sendRoleChangedEmail(targetUserId, workspaceId, role).catch(
        (error) => {
          this.logger.error('Failed to send role changed email:', error);
        },
      );
    } catch (error) {
      console.error(
        '[WorkspacesService] Failed to notify member about role change: ',
        error,
      );
    }

    return updated;
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

    const removed = await this.prisma.$transaction(async (tx) => {
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

    try {
      const shouldSendInApp =
        await this.prisma.notificationPreference.findUnique({
          where: {
            userId_type: {
              userId: targetUserId,
              type: NotificationType.WORKSPACE_MEMBER_REMOVED,
            },
          },
        });

      if (shouldSendInApp?.viaInApp !== false) {
        await this.prisma.notification.create({
          data: {
            recipientId: targetUserId,
            actorId: actor.userId,
            type: NotificationType.WORKSPACE_MEMBER_REMOVED,
            workspaceId,
          },
        });
      }

      this.realtimeRoomService.emitToUser(
        targetUserId,
        REALTIME_EVENTS.WORKSPACE_MEMBER_REMOVED,
        { workspaceId },
      );

      this.sendMemberRemovedEmail(targetUserId, workspaceId).catch((error) => {
        this.logger.error('Failed to send member removed email:', error);
      });
    } catch (error) {
      console.error(
        '[WorkspacesService] Failed to notify removed member:',
        error,
      );
    }

    return removed;
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

  private async sendWorkspaceInviteEmail(
    inviteeId: number,
    inviterId: number,
    workspaceId: number,
  ) {
    // Get invitee's email preference for WORKSPACE_INVITE_RECEIVED
    const pref = await this.prisma.notificationPreference.findUnique({
      where: {
        userId_type: {
          userId: inviteeId,
          type: NotificationType.WORKSPACE_INVITE_RECEIVED,
        },
      },
    });

    // If email is not explicitly enabled, skip
    if (!pref?.viaEmail) {
      return;
    }

    // Get invitee, inviter, and workspace info
    const [invitee, inviter, workspace] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: inviteeId },
        select: { email: true },
      }),
      this.prisma.user.findUnique({
        where: { id: inviterId },
        select: { username: true, profile: true },
      }),
      this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true },
      }),
    ]);

    if (!invitee || !inviter || !workspace) {
      this.logger.warn(
        `Cannot send workspace invite email: invitee=${!!invitee}, inviter=${!!inviter}, workspace=${!!workspace}`,
      );
      return;
    }

    const inviterName =
      inviter.profile?.displayName || inviter.username || 'Someone';
    const appBaseUrl = process.env.APP_BASE_URL || 'https://yourdomain.com';

    await this.mailService.sendNotificationEmail(
      invitee.email,
      `${inviterName} invited you to ${workspace.name}`,
      'WORKSPACE_INVITE_RECEIVED',
      {
        inviterName,
        workspaceName: workspace.name,
        inviteLink: `${appBaseUrl}/app/spaces`,
      },
    );
  }

  private async sendWorkspaceInviteAcceptedEmail(
    inviterId: number,
    accepterId: number,
    workspaceId: number,
  ) {
    // Get inviter's email preference for WORKSPACE_INVITE_ACCEPTED
    const pref = await this.prisma.notificationPreference.findUnique({
      where: {
        userId_type: {
          userId: inviterId,
          type: NotificationType.WORKSPACE_INVITE_ACCEPTED,
        },
      },
    });

    // If email is not explicitly enabled, skip
    if (!pref?.viaEmail) {
      return;
    }

    // Get inviter, accepter, and workspace info
    const [inviter, accepter, workspace] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: inviterId },
        select: { email: true },
      }),
      this.prisma.user.findUnique({
        where: { id: accepterId },
        select: { username: true, profile: true },
      }),
      this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true },
      }),
    ]);

    if (!inviter || !accepter || !workspace) {
      this.logger.warn(
        `Cannot send workspace accepted email: inviter=${!!inviter}, accepter=${!!accepter}, workspace=${!!workspace}`,
      );
      return;
    }

    const accepterName =
      accepter.profile?.displayName || accepter.username || 'Someone';
    const appBaseUrl = process.env.APP_BASE_URL || 'https://yourdomain.com';

    await this.mailService.sendNotificationEmail(
      inviter.email,
      `${accepterName} accepted your invitation to ${workspace.name}`,
      'WORKSPACE_INVITE_ACCEPTED',
      {
        actorName: accepterName,
        workspaceName: workspace.name,
        workspaceLink: `${appBaseUrl}/app/spaces/${workspaceId}`,
      },
    );
  }

  private async sendRoleChangedEmail(
    targetUserId: number,
    workspaceId: number,
    newRole: string,
  ) {
    // Get target user's email preference for WORKSPACE_ROLE_CHANGED
    const pref = await this.prisma.notificationPreference.findUnique({
      where: {
        userId_type: {
          userId: targetUserId,
          type: NotificationType.WORKSPACE_ROLE_CHANGED,
        },
      },
    });

    // If email is not explicitly enabled, skip
    if (!pref?.viaEmail) {
      return;
    }

    // Get target user and workspace info
    const [user, workspace] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { email: true },
      }),
      this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true },
      }),
    ]);

    if (!user || !workspace) {
      this.logger.warn(
        `Cannot send role changed email: user=${!!user}, workspace=${!!workspace}`,
      );
      return;
    }

    const appBaseUrl = process.env.APP_BASE_URL || 'https://yourdomain.com';

    await this.mailService.sendNotificationEmail(
      user.email,
      `Your role in ${workspace.name} has changed`,
      'WORKSPACE_ROLE_CHANGED',
      {
        workspaceName: workspace.name,
        newRole,
        workspaceLink: `${appBaseUrl}/app/spaces/${workspaceId}`,
      },
    );
  }

  private async sendMemberRemovedEmail(
    targetUserId: number,
    workspaceId: number,
  ) {
    // Get target user's email preference for WORKSPACE_MEMBER_REMOVED
    const pref = await this.prisma.notificationPreference.findUnique({
      where: {
        userId_type: {
          userId: targetUserId,
          type: NotificationType.WORKSPACE_MEMBER_REMOVED,
        },
      },
    });

    // If email is not explicitly enabled, skip
    if (!pref?.viaEmail) {
      return;
    }

    // Get target user and workspace info
    const [user, workspace] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { email: true },
      }),
      this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true },
      }),
    ]);

    if (!user || !workspace) {
      this.logger.warn(
        `Cannot send member removed email: user=${!!user}, workspace=${!!workspace}`,
      );
      return;
    }

    await this.mailService.sendNotificationEmail(
      user.email,
      `You have been removed from ${workspace.name}`,
      'WORKSPACE_MEMBER_REMOVED',
      {
        workspaceName: workspace.name,
      },
    );
  }
}
