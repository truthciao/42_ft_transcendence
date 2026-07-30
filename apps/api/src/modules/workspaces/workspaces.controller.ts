import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  Req,
  UseGuards
} from '@nestjs/common';
import { type Request } from 'express';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import type { WorkspaceMember } from 'src/generated/prisma/client';
import { CurrentMembership } from './decorators/current-membership.decorator';
import { Currentuser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { WorkspaceOwnerGuard } from './guards/workspace-owner.guard';
import { WorkspacesService } from './workspaces.service';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Currentuser('userId') userId: number, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(userId, dto.name);
  }

  @Get()
  findMine(@Currentuser('userId') userId: number,) {
    return this.workspacesService.findAllForUser(userId);
  }

  @UseGuards(WorkspaceMemberGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workspacesService.findOne(id);
  }

  @UseGuards(WorkspaceOwnerGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, dto);
  }

  @UseGuards(WorkspaceOwnerGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workspacesService.remove(id);
  }

  @UseGuards(WorkspaceMemberGuard)
  @Post(':id/leave')
  leave(
    @Param('id', ParseIntPipe) id:number,
    @Currentuser('userId') userId: number,
    @CurrentMembership() membership: WorkspaceMember,
  ) {
    return this.workspacesService.leave(id, userId, membership.role)
  }

  @UseGuards(WorkspaceOwnerGuard)
  @Delete(':id/members/:memberUserId')
  removeMemeber(
    @Param('id', ParseIntPipe) id: number,
    @Param('memberUserId', ParseIntPipe) memberUserId: number,
  ) {
    return this.workspacesService.removeMember(id, memberUserId);
  }
}
