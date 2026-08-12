import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { CreateWorkspaceDto } from './dto/create-workspace.dto.js';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.js';
import {
  CreateChannelDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
} from './dto/invite-member.dto.js';
import {
  WorkspaceRole,
  type WorkspaceMember,
} from '../../generated/prisma/client.js';
import { CurrentMembership } from './decorators/current-membership.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { WorkspaceRoleGuard } from './guards/workspace-role.guard.js';
import { WorkspacesService } from './workspaces.service.js';
import { minWorkspaceRole } from './decorators/min-workspace-role.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Post()
  create(
    @CurrentUser('userId') userId: number,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspaces.create(userId, dto.name);
  }

  @Get()
  findMine(@CurrentUser('userId') userId: number) {
    return this.workspaces.findAllForUser(userId);
  }

  // ---- notify ----
  @Get('invites/incoming')
  myInvites(@CurrentUser('userId') userId: number) {
    return this.workspaces.listIncomingInvites(userId);
  }

  // ---- invite management ----

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.ADMIN)
  @Post(':id/invites')
  inviteMember(
    @Param('id', ParseIntPipe) id: number,
    @CurrentMembership() membership: WorkspaceMember,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspaces.createInvite(id, membership, dto);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.ADMIN)
  @Get(':id/invites')
  pendingInvites(@Param('id', ParseIntPipe) id: number) {
    return this.workspaces.listWorkspaceInvites(id);
  }

  @Get('invites/:inviteId')
  inviteDetail(
    @Param('inviteId', ParseIntPipe) inviteId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.workspaces.getInviteForInvitee(inviteId, userId);
  }

  @Get('invites/token/:token')
  invitebyToken(
    @Param('token') token: string,
    @CurrentUser('userId') userId: number,
  ) {
    return this.workspaces.getInviteByToken(token, userId);
  }

  @Post('invites/:inviteId/accept')
  accept(
    @Param('inviteId', ParseIntPipe) inviteId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.workspaces.acceptInvite(inviteId, userId);
  }

  @Post('invites/:inviteId/reject')
  reject(
    @Param('inviteId', ParseIntPipe) inviteId: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.workspaces.rejectInvite(inviteId, userId);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.MEMBER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workspaces.findOne(id);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.MEMBER)
  @Get(':id/members')
  listMembers(@Param('id', ParseIntPipe) id: number) {
    return this.workspaces.listMembers(id);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspaces.update(id, dto);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.OWNER)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workspaces.remove(id);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.MEMBER)
  @Post(':id/leave')
  leave(
    @Param('id', ParseIntPipe) id: number,
    @CurrentMembership() membership: WorkspaceMember,
  ) {
    return this.workspaces.leave(id, membership);
  }

  // ---- member management ----

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.OWNER)
  @Patch(':id/members/:memberUserId/role')
  changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberUserId', ParseIntPipe) memberUserId: number,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspaces.changeMemeberRole(id, memberUserId, dto.role);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.ADMIN)
  @Delete(':id/members/:memberUserId')
  removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberUserId', ParseIntPipe) memberUserId: number,
    @CurrentMembership() actor: WorkspaceMember,
  ) {
    return this.workspaces.removeMember(id, memberUserId, actor);
  }

  // ---- channel ----

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.ADMIN)
  @Post(':id/channels')
  createChannel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateChannelDto,
    @CurrentMembership() actor: WorkspaceMember,
  ) {
    return this.workspaces.createChannel(id, actor.userId, dto);
  }

  @UseGuards(WorkspaceRoleGuard)
  @minWorkspaceRole(WorkspaceRole.MEMBER)
  @Get(':id/channels')
  channels(
    @Param('id', ParseIntPipe) id: number,
    @CurrentMembership() actor: WorkspaceMember,
  ) {
    return this.workspaces.listChannels(id, actor.userId);
  }
}
