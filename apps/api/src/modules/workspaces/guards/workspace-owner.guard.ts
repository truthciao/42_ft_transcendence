import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkspaceRole } from 'src/generated/prisma/client';
import { findMembershipOrThrow, getCurrentUserId, parseWorkspaceId } from './workspace-guard.utils';
import { Observable } from 'rxjs';

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
      throw new ForbiddenException('Only the workspace owner can perform this action');
    }

    req.workspaceMembership = membership;

    return true;
  }
}
