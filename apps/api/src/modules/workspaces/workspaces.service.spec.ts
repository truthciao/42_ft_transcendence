import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { WorkspaceRole } from '../../generated/prisma/client.js';
import { WorkspacesService } from './workspaces.service.js';
import { jest } from '@jest/globals';

type MockWorkspace = {
  id: number;
  name?: string;
  members?: unknown[];
};

type MockWorkspaceMember = {
  workspaceId: number;
  userId: number;
  role: WorkspaceRole;
};

type MockUser = {
  id: number;
};

const createWorkspace = jest.fn<
  () => Promise<MockWorkspace>
>();

const findManyWorkspace = jest.fn<
  () => Promise<MockWorkspace[]>
>();

const findUniqueWorkspace = jest.fn<
  () => Promise<MockWorkspace | null>
>();

const updateWorkspace = jest.fn<
  () => Promise<MockWorkspace>
>();

const deleteWorkspace = jest.fn<
  () => Promise<unknown>
>();

const findUniqueWorkspaceMember = jest.fn<
  () => Promise<MockWorkspaceMember | null>
>();

const createWorkspaceMember = jest.fn<
  () => Promise<MockWorkspaceMember>
>();

const updateWorkspaceMember = jest.fn<
  () => Promise<MockWorkspaceMember>
>();

const deleteWorkspaceMember = jest.fn<
  () => Promise<unknown>
>();

const countWorkspaceMember = jest.fn<
  () => Promise<number>
>();

const findUniqueUser = jest.fn<
  () => Promise<MockUser | null>
>();

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
      create: createWorkspaceMember,
      update: updateWorkspaceMember,
      delete: deleteWorkspaceMember,
      count: countWorkspaceMember,
    },
    user: {
      findUnique: findUniqueUser,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new WorkspacesService(prisma as unknown as PrismaService);
  });

  it('creates a workspace with the creator as OWNER member', async () => {
    prisma.workspace.create.mockResolvedValue({ id: 1, name: 'My Workspace' });

    await service.create(1, 'My Workspace');

    expect(prisma.workspace.create).toHaveBeenCalledWith({
      data: {
        name: 'My Workspace',
        ownerId: 1,
        members: { create: { userId: 1, role: WorkspaceRole.OWNER } },
      },
      include: { members: true },
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

  describe('inviteMember', () => {
    it('invites a new member as MEMBER by default', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({ id: 2 });
      prisma.workspaceMember.create.mockResolvedValue({
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.MEMBER,
      });

      await service.inviteMember(1, 2);

      expect(prisma.workspaceMember.create).toHaveBeenCalledWith({
        data: { workspaceId: 1, userId: 2, role: WorkspaceRole.MEMBER },
      });
    });

    it('rejects inviting a user who is already a member', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 1,
        userId: 2,
        role: WorkspaceRole.MEMBER,
      });

      await expect(service.inviteMember(1, 2)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('leave / removeMember — 唯一 owner 保护', () => {
    it('blocks the sole owner from leaving', async () => {
      prisma.workspaceMember.count.mockResolvedValue(1);

      await expect(service.leave(1, 1, WorkspaceRole.OWNER)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('allows an owner to leave when there is another owner', async () => {
      prisma.workspaceMember.count.mockResolvedValue(2);
      prisma.workspaceMember.delete.mockResolvedValue({});

      await expect(
        service.leave(1, 1, WorkspaceRole.OWNER),
      ).resolves.toBeDefined();
    });

    it('blocks removing the sole owner', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue({
        workspaceId: 1,
        userId: 1,
        role: WorkspaceRole.OWNER,
      });
      prisma.workspaceMember.count.mockResolvedValue(1);

      await expect(service.removeMember(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
