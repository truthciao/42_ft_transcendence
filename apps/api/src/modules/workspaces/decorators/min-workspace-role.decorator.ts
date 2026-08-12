import { SetMetadata } from '@nestjs/common';
import { WorkspaceRole } from '../../../generated/prisma/enums.js';

export const MIN_WORKSPACE_ROLE = 'minWorkspaceRole';
export const minWorkspaceRole = (role: WorkspaceRole) =>
  SetMetadata(MIN_WORKSPACE_ROLE, role);
