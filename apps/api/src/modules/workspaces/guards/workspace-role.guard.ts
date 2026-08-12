import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { WorkspaceRole } from '../../../generated/prisma/enums.js';
import { MIN_WORKSPACE_ROLE } from '../decorators/min-workspace-role.decorator.js';
import { atLeast } from '../constants/role-rank.js';
import {
  findMembershipOrThrow,
  getCurrentUserId,
  parseWorkspaceId,
} from './workspace-guard.utils.js';

@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required =
      this.reflector.getAllAndOverride<WorkspaceRole>(MIN_WORKSPACE_ROLE, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? WorkspaceRole.MEMBER;

    const req = ctx.switchToHttp().getRequest<Request>();
    const workspaceId = parseWorkspaceId(req);
    const userId = getCurrentUserId(req);
    const membership = await findMembershipOrThrow(
      this.prisma,
      workspaceId,
      userId,
    );

    if (!atLeast(membership.role, required)) {
      console.log('membership.role:', membership.role);
      console.log('required', required);
      throw new ForbiddenException(
        `Requires ${required} role in this workspace`,
      );
    }

    req.workspaceMembership = membership;

    return true;
  }
}
