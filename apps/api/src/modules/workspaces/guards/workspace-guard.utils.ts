import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import type { WorkspaceMember } from 'src/generated/prisma/client';

export function parseWorkspaceId(req: Request): number {
  const parsed = Number(req.params.id);
  if (Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException('Invalid workspace ID');
  }
  return parsed;
}

export function getCurrentUserId(req: Request): number {
  const userId = req.user?.userId;
  if (!userId) {
    throw new BadRequestException('Missing authenticated user');
  }
  return userId;
}

export async function findMembershipOrThrow(
  prisma: PrismaService,
  workspaceId: number,
  userId: number,
): Promise<WorkspaceMember> {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (membership) return membership;

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });
  if (!workspace) throw new NotFoundException('Workspace not found');

  throw new ForbiddenException('You are not a member of this workspace');
}
