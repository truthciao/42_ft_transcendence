import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkspaceRole } from '../../generated/prisma/client';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let prisma: {
    workspace: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      workspace: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new WorkspacesService(prisma as unknown as PrismaService);
  });

  it('creates a workspace with the creator as OWNER member', async () => {
    prisma.workspace.create.mockResolvedValue({
      id: 1,
      name: 'My Workspace',
      ownerId: 1,
      members: [{ id: 1, workspaceId: 1, userId: 1, role: WorkspaceRole.OWNER }],
    });

    await expect(service.create(1, 'My Workspace')).resolves.toMatchObject({
      name: 'My Workspace',
    });

    expect(prisma.workspace.create).toHaveBeenCalledWith({
      data: {
        name: 'My Workspace',
        ownerId: 1,
        members: {
          create: {
            userId: 1,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: { members: true },
    });
  });

  it('finds workspaces the user belongs to', async () => {
    prisma.workspace.findMany.mockResolvedValue([{ id: 1, name: 'My Workspace' }]);

    await expect(service.findAllForUser(1)).resolves.toHaveLength(1);
    expect(prisma.workspace.findMany).toHaveBeenCalledWith({
      where: { members: { some: { userId: 1 } } },
      orderBy: { id: 'asc' },
      include: { members: true },
    });
  });

  describe('findOne', () => {
    it('returns the workspace when the user is a member', async () => {
      prisma.workspace.findUnique.mockResolvedValue({
        id: 1,
        name: 'My Workspace',
        members: [{ userId: 1, role: WorkspaceRole.OWNER }],
      });

      await expect(service.findOne(1, 1)).resolves.toMatchObject({ id: 1 });
    });

    it('throws NotFoundException when workspace does not exist', async () => {
      prisma.workspace.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when the user is not a member', async () => {
      prisma.workspace.findUnique.mockResolvedValue({
        id: 1,
        name: 'My Workspace',
        members: [{ userId: 2, role: WorkspaceRole.OWNER }],
      });

      await expect(service.findOne(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('updates the workspace when the user is OWNER', async () => {
      prisma.workspace.findUnique.mockResolvedValue({
        id: 1,
        members: [{ userId: 1, role: WorkspaceRole.OWNER }],
      });
      prisma.workspace.update.mockResolvedValue({ id: 1, name: 'Renamed' });

      await expect(service.update(1, 1, { name: 'Renamed' })).resolves.toMatchObject({
        name: 'Renamed',
      });
      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Renamed' },
        include: { members: true },
      });
    });

    it('throws ForbiddenException when the user is not OWNER', async () => {
      prisma.workspace.findUnique.mockResolvedValue({
        id: 1,
        members: [{ userId: 1, role: WorkspaceRole.MEMBER }],
      });

      await expect(service.update(1, 1, { name: 'Renamed' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('deletes the workspace when the user is OWNER', async () => {
      prisma.workspace.findUnique.mockResolvedValue({
        id: 1,
        members: [{ userId: 1, role: WorkspaceRole.OWNER }],
      });
      prisma.workspace.delete.mockResolvedValue({ id: 1 });

      await expect(service.remove(1, 1)).resolves.toMatchObject({ id: 1 });
      expect(prisma.workspace.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws ForbiddenException when the user is not OWNER', async () => {
      prisma.workspace.findUnique.mockResolvedValue({
        id: 1,
        members: [{ userId: 1, role: WorkspaceRole.MEMBER }],
      });

      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });
  });
});
