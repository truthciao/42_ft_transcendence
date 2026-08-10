import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { WorkspaceMember } from '../../../generated/prisma/client.js';

// 1. 显式定义带 user 字段的 Request 类型，避免 any/error 校验失败
interface AuthenticatedUserPayload {
  id?: number;
  userId?: number;
}

interface CustomAuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

export function parseWorkspaceId(req: Request): number {
  const parsed = Number(req.params.id);
  // ✅ 逻辑修正：如果不是整数，或者小于等于 0，抛出异常
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException('Invalid workspace ID');
  }
  return parsed;
}

export function getCurrentUserId(req: Request): number {
  // ✅ 强类型断言，彻底消灭 @typescript-eslint/no-unsafe-assignment
  const authReq = req as CustomAuthenticatedRequest;

  // 兼顾 user.id 与 user.userId
  const userId = authReq.user?.id ?? authReq.user?.userId;

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
