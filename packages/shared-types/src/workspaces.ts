import { z } from 'zod';

export const workspaceRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER']);
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;

export const WORKSPACE_ROLE_RANK: Record<WorkspaceRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function atLeastRole(
  role: WorkspaceRole,
  min: WorkspaceRole,
  strict = false,
): boolean {
  return strict
    ? WORKSPACE_ROLE_RANK[role] > WORKSPACE_ROLE_RANK[min]
    : WORKSPACE_ROLE_RANK[role] >= WORKSPACE_ROLE_RANK[min];
}

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(280, 'Keep it under 280 characters').optional(),
  icon: z.string().max(4, 'One emoji is plenty').optional(),
})
export type createWorkspacePayload = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(280).optional(),
  icon: z.string().max(4).optional(),
});
export type UpdateWorkspacePayload = z.infer<typeof updateWorkspaceSchema>;

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-_]+$/, 'Lowercase letters, numbers, - and _ only')
});
export type CreateChannelPayload = z.infer<typeof createChannelSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
})
export type updateMemberRolePayload = z.infer<typeof updateMemberRoleSchema>;

export interface WorkspaceMember {
  id: number;
  workspaceId: number;
  userId: number;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface Workspace {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  icon: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
  myMembership: WorkspaceMember | null;
}

export interface WorkspaceMemberSummary {
  id: number;
  userId: number;
  role: WorkspaceRole;
  joinedAt: string;
  user: {
    username: string;
    profile: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  }
}

export interface WorkspaceChannel {
  id: number;
  workspaceId: number;
  name: string | null;
  isDefault: boolean;
  _count: { members: number };
}
