import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { WorkspaceRole } from '../../../generated/prisma/enums.js';
import {
  findMembershipOrThrow,
  getCurrentUserId,
  parseWorkspaceId,
} from './workspace-guard.utils.js';

@Injectable()
export class WorkspaceOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const workspaceId = parseWorkspaceId(req);
    const userId = getCurrentUserId(req);

    const membership = await findMembershipOrThrow(
      this.prisma,
      workspaceId,
      userId,
    );
    if (membership.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException(
        'Only the workspace owner can perform this action',
      );
    }

    req.workspaceMembership = membership;

    return true;
  }
}
