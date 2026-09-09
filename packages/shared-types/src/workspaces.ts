import { z } from 'zod';

// ─────────────────────────────────────────────
// Workspace Role
// ─────────────────────────────────────────────

export const workspaceRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'MEMBER',
]);

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

// ─────────────────────────────────────────────
// Workspace Request Schemas
// ─────────────────────────────────────────────

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100)
    .regex(/^[a-z0-9-_]+$/, 'Lowercase letters, numbers, - and _ only'),
  description: z.string().max(280, 'Keep it under 280 characters').optional(),
  icon: z.string().max(4, 'One emoji is plenty').optional(),
});

export type CreateWorkspacePayload = z.infer<
  typeof createWorkspaceSchema
>;

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-_]+$/, 'Lowercase letters, numbers, - and _ only')
    .optional(),
  description: z.string().max(280).optional(),
  icon: z.string().max(4).optional(),
});

export type UpdateWorkspacePayload = z.infer<
  typeof updateWorkspaceSchema
>;

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-_]+$/, 'Lowercase letters, numbers, - and _ only'),
});

export type CreateChannelPayload = z.infer<
  typeof createChannelSchema
>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

export type UpdateMemberRolePayload = z.infer<
  typeof updateMemberRoleSchema
>;

// ─────────────────────────────────────────────
// Workspace Response Schemas
// ─────────────────────────────────────────────

export const workspaceMemberSchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),
  workspaceId: z
    .number()
    .int('workspaceId must be an integer')
    .min(1, 'workspaceId must be a positive integer'),
  userId: z
    .number()
    .int('userId must be an integer')
    .min(1, 'userId must be a positive integer'),
  role: workspaceRoleSchema,
  joinedAt: z.string().datetime('joinedAt must be a valid ISO datetime'),
});

export type WorkspaceMember = z.infer<
  typeof workspaceMemberSchema
>;

export const workspaceBaseSchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),
  name: z.string(),
  slug: z.string().nullable(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  ownerId: z
    .number()
    .int('ownerId must be an integer')
    .min(1, 'ownerId must be a positive integer'),
  createdAt: z.string().datetime('createdAt must be a valid ISO datetime'),
  updatedAt: z.string().datetime('updatedAt must be a valid ISO datetime'),
});

export type WorkspaceBase = z.infer<
  typeof workspaceBaseSchema
>;

export const workspaceSchema = workspaceBaseSchema.extend({
  members: workspaceMemberSchema.array(),
  myMembership: workspaceMemberSchema.nullable(),
});

export type Workspace = z.infer<typeof workspaceSchema>;

export const workspaceMemberSummarySchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),
  userId: z
    .number()
    .int('userId must be an integer')
    .min(1, 'userId must be a positive integer'),
  role: workspaceRoleSchema,
  joinedAt: z.string().datetime('joinedAt must be a valid ISO datetime'),
  user: z.object({
    username: z.string(),
    profile: z
      .object({
        displayName: z.string().nullable(),
        avatarUrl: z.string().nullable(),
      })
      .nullable(),
  }),
});

export type WorkspaceMemberSummary = z.infer<
  typeof workspaceMemberSummarySchema
>;

export const workspaceChannelSchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),
  workspaceId: z
    .number()
    .int('workspaceId must be an integer')
    .min(1, 'workspaceId must be a positive integer'),
  name: z.string().nullable(),
  isDefault: z.boolean(),
  _count: z.object({
    members: z
      .number()
      .int('members count must be an integer')
      .min(0, 'members count must not be negative'),
  }),
});

export type WorkspaceChannel = z.infer<
  typeof workspaceChannelSchema
>;

// ─────────────────────────────────────────────
// Workspace Invite Schemas
// ─────────────────────────────────────────────

export const workspaceInviteStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'REVOKED',
]);

export type WorkspaceInviteStatus = z.infer<
  typeof workspaceInviteStatusSchema
>;

export const inviteMemberSchema = z.object({
  userId: z.number().int().positive(),
  email: z.email().optional(),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
});

export type InviteMemberPayload = z.infer<
  typeof inviteMemberSchema
>;

export const transferOwnershipSchema = z.object({
  targetUserId: z.number().int().positive(),
});

export type TransferOwnershipPayload = z.infer<
  typeof transferOwnershipSchema
>;

export const workspaceInviteUserSummarySchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),
  username: z.string(),
  profile: z
    .object({
      displayName: z.string().nullable(),
      avatarUrl: z.string().nullable(),
    })
    .nullable(),
});

export type WorkspaceInviteUserSummary = z.infer<
  typeof workspaceInviteUserSummarySchema
>;

export const workspaceInviteSummarySchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),
  status: workspaceInviteStatusSchema,
  expiresAt: z.string().datetime('expiresAt must be a valid ISO datetime'),
  createdAt: z.string().datetime('createdAt must be a valid ISO datetime'),
  respondedAt: z
    .string()
    .datetime('respondedAt must be a valid ISO datetime')
    .nullable(),
  invitee: workspaceInviteUserSummarySchema.nullable(),
  inviter: workspaceInviteUserSummarySchema,
});

export type WorkspaceInviteSummary = z.infer<
  typeof workspaceInviteSummarySchema
>;

export const incomingWorkspaceInviteSchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),
  workspaceId: z
    .number()
    .int('workspaceId must be an integer')
    .min(1, 'workspaceId must be a positive integer'),
  role: workspaceRoleSchema,
  status: workspaceInviteStatusSchema,
  expiresAt: z.string().datetime('expiresAt must be a valid ISO datetime'),
  createdAt: z.string().datetime('createdAt must be a valid ISO datetime'),
  workspace: z.object({
    id: z
      .number()
      .int('id must be an integer')
      .min(1, 'id must be a positive integer'),
    name: z.string(),
  }),
  inviter: workspaceInviteUserSummarySchema,
});

export type IncomingWorkspaceInvite = z.infer<
  typeof incomingWorkspaceInviteSchema
>;

export const workspaceInviteDetailSchema = z.object({
  id: z
    .number()
    .int('id must be an integer')
    .min(1, 'id must be a positive integer'),
  workspaceId: z
    .number()
    .int('workspaceId must be an integer')
    .min(1, 'workspaceId must be a positive integer'),
  role: workspaceRoleSchema,
  status: workspaceInviteStatusSchema,
  expiresAt: z.string().datetime('expiresAt must be a valid ISO datetime'),
  createdAt: z.string().datetime('createdAt must be a valid ISO datetime'),
  respondedAt: z
    .string()
    .datetime('respondedAt must be a valid ISO datetime')
    .nullable(),
  workspace: z.object({
    id: z
      .number()
      .int('id must be an integer')
      .min(1, 'id must be a positive integer'),
    name: z.string(),
    _count: z.object({
      members: z
        .number()
        .int('members count must be an integer')
        .min(0, 'members count must not be negative'),
    }),
  }),
  inviter: workspaceInviteUserSummarySchema,
});

export type WorkspaceInviteDetail = z.infer<
  typeof workspaceInviteDetailSchema
>;

// ─────────────────────────────────────────────
// Invite Mutation Responses
// ─────────────────────────────────────────────

export const acceptInviteResponseSchema = z.object({
  workspaceId: z
    .number()
    .int('workspaceId must be an integer')
    .min(1, 'workspaceId must be a positive integer'),
});

export type AcceptInviteResponse = z.infer<
  typeof acceptInviteResponseSchema
>;
