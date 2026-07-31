import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  findMembershipOrThrow,
  getCurrentUserId,
  parseWorkspaceId,
} from './workspace-guard.utils';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const workspaceId = parseWorkspaceId(req);
    const userId = getCurrentUserId(req);

    req.workspaceMembership = await findMembershipOrThrow(
      this.prisma,
      workspaceId,
      userId,
    );

    return true;
  }
}
