import { Module } from '@nestjs/common';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard.js';
import { WorkspaceOwnerGuard } from './guards/workspace-owner.guard.js';
import { WorkspaceController } from './workspaces.controller.js';
import { WorkspacesService } from './workspaces.service.js';

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspacesService, WorkspaceOwnerGuard, WorkspaceMemberGuard],
})
export class WorkspacesMoudule {}
