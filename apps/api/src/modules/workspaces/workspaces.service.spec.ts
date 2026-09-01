import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  ConversationType,
  WorkspaceInviteStatus,
  WorkspaceRole,
} from '../../generated/prisma/client.js';
import { WorkspacesService } from './workspaces.service.js';
import type { RealtimeRoomService } from '../realtime/services/realtime-room.service.js';
import { jest } from '@jest/globals';

const objectContaining = <T extends object>(shape: T): T =>
  expect.objectContaining(shape) as T;

type MockWorkspace = {
  id: number;
  name?: string;
  ownerId?: number;
  members?: unknown[];
  channels?: unknown[];
};

type MockWorkspaceMember = {
  id?: number;
  workspaceId: number;
  userId: number;
  role: WorkspaceRole;
};

type MockUser = {
  id: number;
};

type MockInvite = {
  id: number;
  workspaceId: number;
  inviterId: number;
  inviteeId: number | null;
  email: string | null;
  role: WorkspaceRole;
  status: WorkspaceInviteStatus;
  token: string;
  expiresAt: Date;
  respondedAt: Date | null;
};

type MockConversation = {
  id: number;
  workspaceId: number;
  type: ConversationType;
  name?: string | null;
  isDefault?: boolean;
};

// ---- Types derived directly from the service, so we never need `any` ----
type CreateInviteActor = Parameters<WorkspacesService['createInvite']>[1];
type InviteMemberDto = Parameters<WorkspacesService['createInvite']>[2];
type RemoveMemberActor = Parameters<WorkspacesService['removeMember']>[2];
type LeaveMembership = Parameters<WorkspacesService['leave']>[1];
type ChangeMemberRoleActor = Parameters<WorkspacesService['changeMemberRole']>[3];

// ---- workspace ----
const createWorkspace = jest.fn<() => Promise<MockWorkspace>>();
const findManyWorkspace = jest.fn<() => Promise<MockWorkspace[]>>();
const findUniqueWorkspace = jest.fn<() => Promise<MockWorkspace | null>>();
const updateWorkspace = jest.fn<() => Promise<MockWorkspace>>();
const deleteWorkspace = jest.fn<() => Promise<unknown>>();

// ---- workspaceMember ----
const findUniqueWorkspaceMember =
  jest.fn<() => Promise<MockWorkspaceMember | null>>();
const findManyWorkspaceMember = jest.fn<() => Promise<MockWorkspaceMember[]>>();
const createWorkspaceMember = jest.fn<() => Promise<MockWorkspaceMember>>();
const updateWorkspaceMember = jest.fn<() => Promise<MockWorkspaceMember>>();
const deleteWorkspaceMember = jest.fn<() => Promise<unknown>>();

// ---- workspaceInvite ----
const findUniqueWorkspaceInvite = jest.fn<() => Promise<MockInvite | null>>();
const findFirstWorkspaceInvite = jest.fn<() => Promise<MockInvite | null>>();
const findManyWorkspaceInvite = jest.fn<() => Promise<MockInvite[]>>();
const createWorkspaceInvite = jest.fn<() => Promise<MockInvite>>();
const updateWorkspaceInvite = jest.fn<() => Promise<MockInvite>>();

// ---- user ----
const findUniqueUser = jest.fn<() => Promise<MockUser | null>>();

// ---- conversation ----
const findManyConversation = jest.fn<() => Promise<MockConversation[]>>();
const findFirstConversation = jest.fn<() => Promise<MockConversation | null>>();
const createConversation = jest.fn<() => Promise<MockConversation>>();

// ---- conversationMember ----
const createManyConversationMember = jest.fn<() => Promise<unknown>>();
const deleteManyConversationMember = jest.fn<() => Promise<unknown>>();

// ---- notification ----
const createNotification = jest.fn<() => Promise<{ id:number }>>();

// ---- $transaction ----
const transaction = jest.fn();

const emitToUser = jest.fn();
const realtimeRoomServiceMock = { emitToUser };

const mockMailService = {
  sendNotificationEmail: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
};

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  const prisma = {
    workspace: {
      create: createWorkspace,
      findMany: findManyWorkspace,
      findUnique: findUniqueWorkspace,
      update: updateWorkspace,
      delete: deleteWorkspace,
    },
    workspaceMember: {
      findUnique: findUniqueWorkspaceMember,
      findMany: findManyWorkspaceMember,
      create: createWorkspaceMember,
      update: updateWorkspaceMember,
      delete: deleteWorkspaceMember,
    },
    workspaceInvite: {
      findUnique: findUniqueWorkspaceInvite,
      findFirst: findFirstWorkspaceInvite,
      findMany: findManyWorkspaceInvite,
      create: createWorkspaceInvite,
      update: updateWorkspaceInvite,
    },
    user: {
      findUnique: findUniqueUser,
    },
    conversation: {
      findMany: findManyConversation,
      findFirst: findFirstConversation,
      create: createConversation,
    },
    conversationMember: {
      createMany: createManyConversationMember,
      deleteMany: deleteManyConversationMember,
    },
    notification: {
      create: createNotification,
    },
    $transaction: transaction,
  };

  const workspaceMember = (
    over: Partial<MockWorkspaceMember> = {},
  ): MockWorkspaceMember => ({
    workspaceId: 1,
    userId: 1,
    role: WorkspaceRole.MEMBER,
    ...over,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    createNotification.mockResolvedValue({
      id: 1,
    });

    // default $transaction implementation: supports both array-of-promises and callback style
    transaction.mockImplementation((arg: unknown) => {
      if (typeof arg === 'function') {
        return (arg as (tx: unknown) => unknown)(prisma);
      }
      return Promise.all(arg as Promise<unknown>[]);
    });

    service = new WorkspacesService(
      prisma as unknown as PrismaService,
      realtimeRoomServiceMock as unknown as RealtimeRoomService,
      mockMailService as any,
    );
  });

  describe('create', () => {
    it('creates a workspace with the creator as OWNER member and a default #general channel', async () => {
      prisma.workspace.create.mockResolvedValue({
        id: 1,
        name: 'My Workspace',
      });

      await service.create(1, {name: 'My Workspace'});

      expect(prisma.workspace.create).toHaveBeenCalledWith(
        objectContaining({
          data: objectContaining({
            name: 'My Workspace',
            ownerId: 1,
            members: {
              create: { userId: 1, role: WorkspaceRole.OWNER },
            },
            channels: {
              create: objectContaining({
                type: ConversationType.CHANNEL,
                name: 'general',
                isDefault: true,
                createdById: 1,
              }),
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the workspace when it exists', async () => {
      prisma.workspace.findUnique.mockResolvedValue({ id: 1, members: [] });

      await expect(service.findOne(1)).resolves.toMatchObject({ id: 1 });
    });

    it('throws NotFoundException when workspace does not exist', async () => {
      prisma.workspace.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates only provided fields', async () => {
      prisma.workspace.update.mockResolvedValue({ id: 1, name: 'New Name' });

      await service.update(1, { name: 'New Name' });

      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'New Name' },
        include: { members: true },
      });
    });
  });

  describe('createInvite', () => {
    const owner: CreateInviteActor = {
      id: 1,
      workspaceId: 1,
      userId: 1,
      role: WorkspaceRole.OWNER,
    } as CreateInviteActor;
    const admin: CreateInviteActor = {
      id: 2,
      workspaceId: 1,
      userId: 2,
      role: WorkspaceRole.ADMIN,
    } as CreateInviteActor;

    it('rejects inviting as OWNER role', async () => {
      const dto = {
        role: WorkspaceRole.OWNER as WorkspaceRole,
        userId: 3,
      } as InviteMemberDto;

      await expect(service.createInvite(1, owner, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects an ADMIN actor inviting another ADMIN', async () => {
      const dto = {
        role: WorkspaceRole.ADMIN,
        userId: 3,
      } as InviteMemberDto;

      await expect(service.createInvite(1, admin, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('requires either userId or email', async () => {
      const dto = { role: WorkspaceRole.MEMBER } as InviteMemberDto;

      await expect(service.createInvite(1, owner, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when invited user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const dto = {
        role: WorkspaceRole.MEMBER,
        userId: 99,
      } as InviteMemberDto;

      await expect(service.createInvite(1, owner, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects inviting a user who is already a member', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 3 });
      prisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 1,
        userId: 3,
        role: WorkspaceRole.MEMBER,
      });
      const dto = {
        role: WorkspaceRole.MEMBER,
        userId: 3,
      } as InviteMemberDto;

      await expect(service.createInvite(1, owner, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('rejects when an invite is already pending for that user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 3 });
      prisma.workspaceMember.findUnique.mockResolvedValue(null);
      prisma.workspaceInvite.findFirst.mockResolvedValue({
        id: 10,
        status: WorkspaceInviteStatus.PENDING,
      } as unknown as MockInvite);
      const dto = {
        role: WorkspaceRole.MEMBER,
        userId: 3,
      } as InviteMemberDto;

      await expect(service.createInvite(1, owner, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates the invite when valid', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 3 });
      prisma.workspaceMember.findUnique.mockResolvedValue(null);
      prisma.workspaceInvite.findFirst.mockResolvedValue(null);
      prisma.workspaceInvite.create.mockResolvedValue({
        id: 1,
      } as unknown as MockInvite);

      await service.createInvite(1, owner, {
        role: WorkspaceRole.MEMBER,
        userId: 3,
      });

      expect(prisma.workspaceInvite.create).toHaveBeenCalledWith(
        objectContaining({
          data: objectContaining({
            workspaceId: 1,
            inviterId: 1,
            inviteeId: 3,
            role: WorkspaceRole.MEMBER,
            status: WorkspaceInviteStatus.PENDING,
          }),
        }),
      );
    });
  });

  describe('acceptInvite', () => {
    const baseInvite: MockInvite = {
      id: 1,
      workspaceId: 1,
      inviterId: 1,
      inviteeId: 2,
      email: null,
      role: WorkspaceRole.MEMBER,
      status: WorkspaceInviteStatus.PENDING,
      token: 'tok',
      expiresAt: new Date(Date.now() + 864e5),
      respondedAt: null,
    };

    it('throws NotFoundException when invite does not exist or belongs to another user', async () => {
      prisma.workspaceInvite.findUnique.mockResolvedValue(null);

      await expect(service.acceptInvite(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when invite is not PENDING', async () => {
      prisma.workspaceInvite.findUnique.mockResolvedValue({
        ...baseInvite,
        status: WorkspaceInviteStatus.ACCEPTED,
      });

      await expect(service.acceptInvite(1, 2)).rejects.toThrow(
        ConflictException,
      );
    });

    it('revokes and throws BadRequestException when invite has expired', async () => {
      prisma.workspaceInvite.findUnique.mockResolvedValue({
        ...baseInvite,
        expiresAt: new Date(Date.now() - 1000),
      });
      prisma.workspaceInvite.update.mockResolvedValue(
        {} as unknown as MockInvite,
      );

      await expect(service.acceptInvite(1, 2)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.workspaceInvite.update).toHaveBeenCalledWith(
        objectContaining({
          data: objectContaining({ status: 'REVOKED' }),
        }),
      );
    });

    it('creates membership, joins channels and marks invite ACCEPTED', async () => {
      prisma.workspaceInvite.findUnique.mockResolvedValue(baseInvite);
      prisma.workspaceMember.create.mockResolvedValue(
        {} as unknown as MockWorkspaceMember,
      );
      prisma.conversation.findMany.mockResolvedValue([
        { id: 10, isDefault: true },
        { id: 11, isDefault: false },
      ] as unknown as MockConversation[]);
      prisma.conversationMember.createMany.mockResolvedValue({});
      prisma.workspaceInvite.update.mockResolvedValue(
        {} as unknown as MockInvite,
      );

      const result = await service.acceptInvite(1, 2);

      expect(prisma.workspaceMember.create).toHaveBeenCalledWith({
        data: {
          workspaceId: baseInvite.workspaceId,
          userId: 2,
          role: baseInvite.role,
        },
      });
      expect(prisma.conversationMember.createMany).toHaveBeenCalledWith({
        data: [
          { conversationId: 10, userId: 2 },
          { conversationId: 11, userId: 2 },
        ],
        skipDuplicates: true,
      });
      expect(prisma.workspaceInvite.update).toHaveBeenCalledWith(
        objectContaining({
          data: objectContaining({ status: 'ACCEPTED' }),
        }),
      );
      expect(result).toEqual({ workspaceId: baseInvite.workspaceId });
      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientId: baseInvite.inviterId,
            actorId: 2,
            type: 'WORKSPACE_INVITE_ACCEPTED',
            workspaceId: baseInvite.workspaceId,
          }),
        }),
      );
    });
  });

  describe('rejectInvite', () => {
    const baseInvite: MockInvite = {
      id: 1,
      workspaceId: 1,
      inviterId: 1,
      inviteeId: 2,
      email: null,
      role: WorkspaceRole.MEMBER,
      status: WorkspaceInviteStatus.PENDING,
      token: 'tok',
      expiresAt: new Date(Date.now() + 864e5),
      respondedAt: null,
    };

    it('throws NotFoundException when invite does not exist or belongs to another user', async () => {
      prisma.workspaceInvite.findUnique.mockResolvedValue(null);

      await expect(service.rejectInvite(1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when invite is not PENDING', async () => {
      prisma.workspaceInvite.findUnique.mockResolvedValue({
        ...baseInvite,
        status: WorkspaceInviteStatus.REJECTED,
      });

      await expect(service.rejectInvite(1, 2)).rejects.toThrow(
        ConflictException,
      );
    });

    it('marks invite REJECTED when valid', async () => {
      prisma.workspaceInvite.findUnique.mockResolvedValue(baseInvite);
      prisma.workspaceInvite.update.mockResolvedValue(
        {} as unknown as MockInvite,
      );

      await service.rejectInvite(1, 2);

      expect(prisma.workspaceInvite.update).toHaveBeenCalledWith(
        objectContaining({
          data: objectContaining({ status: 'REJECTED' }),
        }),
      );
    });
  });

  describe('changeMemberRole', () => {
    const actor: ChangeMemberRoleActor = {
      id: 1,
      workspaceId: 1,
      userId: 1,
      role: WorkspaceRole.OWNER,
      joinedAt: new Date(),
    };
    
    it('rejects setting role to OWNER', async () => {
      await expect(
        service.changeMemberRole(1, 2, WorkspaceRole.OWNER, actor),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when target is not a member', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(
        service.changeMemberRole(1, 2, WorkspaceRole.ADMIN, actor),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects demoting the owner directly', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.OWNER,
      });

      await expect(
        service.changeMemberRole(1, 2, WorkspaceRole.ADMIN, actor),
      ).rejects.toThrow(BadRequestException);
    });

    it('returns target unchanged when role is the same', async () => {
      const target: MockWorkspaceMember = {
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.MEMBER,
      };
      prisma.workspaceMember.findUnique.mockResolvedValue(target);

      const result = await service.changeMemberRole(
        1,
        2,
        WorkspaceRole.MEMBER,
        actor,
      );

      expect(result).toEqual(target);
      expect(prisma.workspaceMember.update).not.toHaveBeenCalled();
    });

    it('updates role when different', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.MEMBER,
      });

      prisma.workspaceMember.update.mockResolvedValue(
        {} as unknown as MockWorkspaceMember,
      );

      const actor: ChangeMemberRoleActor = {
        id: 1,
        workspaceId: 1,
        userId: 1,
        role: WorkspaceRole.OWNER,
        joinedAt: new Date(),
      };

      await service.changeMemberRole(
        1,
        2,
        WorkspaceRole.ADMIN,
        actor,
      );

      expect(prisma.workspaceMember.update).toHaveBeenCalledWith({
        where: { workspaceId_userId: { workspaceId: 1, userId: 2 } },
        data: { role: WorkspaceRole.ADMIN },
      });

      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientId: 2,
            actorId: 1,
            type: 'WORKSPACE_ROLE_CHANGED',
            workspaceId: 1,
          }),
        }),
      );
    });
  });

  describe('removeMember', () => {
    it('rejects removing yourself', async () => {
      const actor = {
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.ADMIN,
      } as RemoveMemberActor;

      await expect(service.removeMember(1, 2, actor)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when target is not a member', async () => {
      const actor = {
        workspaceId: 1,
        userId: 1,
        role: WorkspaceRole.OWNER,
      } as RemoveMemberActor;
      prisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(service.removeMember(1, 2, actor)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects removing the owner', async () => {
      const actor = {
        workspaceId: 1,
        userId: 1,
        role: WorkspaceRole.OWNER,
      } as RemoveMemberActor;
      prisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.OWNER,
      });

      await expect(service.removeMember(1, 2, actor)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('rejects an ADMIN removing another ADMIN or higher', async () => {
      const actor = {
        workspaceId: 1,
        userId: 1,
        role: WorkspaceRole.ADMIN,
      } as RemoveMemberActor;
      prisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.ADMIN,
      });

      await expect(service.removeMember(1, 2, actor)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('removes the member and cleans up channel memberships', async () => {
      const actor = {
        workspaceId: 1,
        userId: 1,
        role: WorkspaceRole.OWNER,
      } as RemoveMemberActor;
      prisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.MEMBER,
      });
      prisma.conversation.findMany.mockResolvedValue([
        { id: 10 },
        { id: 11 },
      ] as unknown as MockConversation[]);
      prisma.conversationMember.deleteMany.mockResolvedValue({});
      prisma.workspaceMember.delete.mockResolvedValue({});

      await service.removeMember(1, 2, actor);

      expect(prisma.conversationMember.deleteMany).toHaveBeenCalledWith({
        where: { userId: 2, conversationId: { in: [10, 11] } },
      });
      expect(prisma.workspaceMember.delete).toHaveBeenCalledWith({
        where: { workspaceId_userId: { workspaceId: 1, userId: 2 } },
      });
      expect(createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientId: 2,
            actorId: 1,
            type: 'WORKSPACE_MEMBER_REMOVED',
            workspaceId: 1,
          }),
        }),
      );
    });
  });

  describe('leave', () => {
    it('blocks the owner from leaving directly', async () => {
      const membership = {
        workspaceId: 1,
        userId: 1,
        role: WorkspaceRole.OWNER,
      } as LeaveMembership;

      await expect(service.leave(1, membership)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('allows a non-owner member to leave and removes them from workspace channels', async () => {
      const membership = {
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.MEMBER,
      } as LeaveMembership;

      prisma.conversation.findMany.mockResolvedValue([
        { id: 10 },
        { id: 11 },
      ] as unknown as MockConversation[]);
      prisma.conversationMember.deleteMany.mockResolvedValue({});
      prisma.workspaceMember.delete.mockResolvedValue({});

      await service.leave(1, membership);

      expect(prisma.conversationMember.deleteMany).toHaveBeenCalledWith({
        where: { userId: 2, conversationId: { in: [10, 11] } },
      });
      expect(prisma.workspaceMember.delete).toHaveBeenCalledWith({
        where: { workspaceId_userId: { workspaceId: 1, userId: 2 } },
      });
    });
  });

  describe('transferOwnership', () => {
    it('rejects transferring to yourself', async () => {
      await expect(service.transferOwnership(1, 1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when target is not a member', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue(null);

      await expect(service.transferOwnership(1, 1, 2)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('transfers ownership when valid', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.MEMBER,
      });
      prisma.workspaceMember.update.mockResolvedValue(
        {} as unknown as MockWorkspaceMember,
      );
      prisma.workspace.update.mockResolvedValue({} as unknown as MockWorkspace);

      await service.transferOwnership(1, 1, 2);

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('createChannel', () => {
    it('rejects a duplicate channel name', async () => {
      prisma.workspaceMember.findMany.mockResolvedValue([
        workspaceMember({ userId: 1 }),
      ]);
      prisma.conversation.findFirst.mockResolvedValue({
        id: 5,
      } as unknown as MockConversation);

      await expect(
        service.createChannel(1, 1, { name: 'general' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates the channel with all workspace members', async () => {
      prisma.workspaceMember.findMany.mockResolvedValue([
        workspaceMember({ userId: 1 }),
        workspaceMember({ userId: 2 }),
      ]);
      prisma.conversation.findFirst.mockResolvedValue(null);
      prisma.conversation.create.mockResolvedValue({
        id: 20,
      } as unknown as MockConversation);

      await service.createChannel(1, 1, { name: 'random' });

      expect(prisma.conversation.create).toHaveBeenCalledWith(
        objectContaining({
          data: objectContaining({
            workspaceId: 1,
            type: 'CHANNEL',
            name: 'random',
            createdById: 1,
            members: { create: [{ userId: 1 }, { userId: 2 }] },
          }),
        }),
      );
    });
  });
});
