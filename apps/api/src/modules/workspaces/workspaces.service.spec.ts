import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkspaceRole } from '../../generated/prisma/client';
import { WorkspacesService } from './workspaces.service';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let prisma: {
    workspace: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock; delete: jest.Mock };
    workspaceMember: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock; count: jest.Mock };
    user: { findUnique: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      workspace: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
      workspaceMember: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      user: { findUnique: jest.fn() },
    };

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
      prisma.workspaceMember.create.mockResolvedValue({ workspaceId: 1, userId: 2, role: WorkspaceRole.MEMBER });

      await service.inviteMember(1, 2);

      expect(prisma.workspaceMember.create).toHaveBeenCalledWith({
        data: { workspaceId: 1, userId: 2, role: WorkspaceRole.MEMBER },
      });
    });

    it('rejects inviting a user who is already a member', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue({ workspaceId: 1, userId: 2 });

      await expect(service.inviteMember(1, 2)).rejects.toThrow(BadRequestException);
    });
  });

  describe('leave / removeMember — 唯一 owner 保护', () => {
    it('blocks the sole owner from leaving', async () => {
      prisma.workspaceMember.count.mockResolvedValue(1);

      await expect(service.leave(1, 1, WorkspaceRole.OWNER)).rejects.toThrow(BadRequestException);
    });

    it('allows an owner to leave when there is another owner', async () => {
      prisma.workspaceMember.count.mockResolvedValue(2);
      prisma.workspaceMember.delete.mockResolvedValue({});

      await expect(service.leave(1, 1, WorkspaceRole.OWNER)).resolves.toBeDefined();
    });

    it('blocks removing the sole owner', async () => {
      prisma.workspaceMember.findUnique.mockResolvedValue({ workspaceId: 1, userId: 1, role: WorkspaceRole.OWNER });
      prisma.workspaceMember.count.mockResolvedValue(1);

      await expect(service.removeMember(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
