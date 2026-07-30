import { Module } from '@nestjs/common';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { WorkspaceOwnerGuard } from './guards/workspace-owner.guard';
import { WorkspaceController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspacesService, WorkspaceOwnerGuard, WorkspaceMemberGuard],
})
export class WorkspacesMoudule {}
