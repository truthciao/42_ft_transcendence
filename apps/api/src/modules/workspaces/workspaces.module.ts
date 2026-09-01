import { Module } from '@nestjs/common';
import { WorkspaceRoleGuard } from './guards/workspace-role.guard.js';
import { WorkspaceController } from './workspaces.controller.js';
import { WorkspacesService } from './workspaces.service.js';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { MailModule } from '../mail/mail.module.js';

@Module({
  imports: [RealtimeModule, MailModule],
  controllers: [WorkspaceController],
  providers: [WorkspacesService, WorkspaceRoleGuard],
})
export class WorkspacesModule {}
