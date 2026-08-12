import { WorkspaceRole } from '../../../generated/prisma/enums.js';

export const ROLE_RANK: Record<WorkspaceRole, number> = {
  [WorkspaceRole.MEMBER]: 1,
  [WorkspaceRole.ADMIN]: 2,
  [WorkspaceRole.OWNER]: 3,
};

export const atLeast = (a: WorkspaceRole, b: WorkspaceRole, strict = false) =>
  strict ? ROLE_RANK[a] > ROLE_RANK[b] : ROLE_RANK[a] >= ROLE_RANK[b];
