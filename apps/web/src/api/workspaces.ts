import { httpDelete, httpGet, httpPatch, httpPost } from '@/lib/http';
import type {
  Workspace,
  WorkspaceMemberSummary,
  WorkspaceChannel,
  UpdateWorkspacePayload,
  CreateChannelPayload,
  updateMemberRolePayload,
  IncomingWorkspaceInvite,
  WorkspaceInviteSummary,
  WorkspaceInviteDetail,
  InviteMemberPayload,
  transferOwnershipPayload,
} from '@repo/shared-types';

export function getWorkspaces() {
  return httpGet<Workspace[]>('/workspaces');
}

export function getWorkspace(id: number) {
  return httpGet<Workspace>(`/workspaces/${id}`);
}

export function createWorkspace(payload: CreateChannelPayload) {
  return httpPost<Workspace>('/workspaces', payload);
}

export function updateWorkspace(id: number, payload: UpdateWorkspacePayload) {
  return httpPatch<Workspace>(`/workspaces/${id}`, payload);
}

export function deleteWorkspace(id: number) {
  return httpDelete<void>(`/workspaces/${id}`);
}

export function leaveWorkspace(id: number) {
  return httpPost<void>(`/workspaces/${id}/leave`);
}

export function getWorkspaceMembers(id: number) {
  return httpGet<WorkspaceMemberSummary[]>(`/workspaces/${id}/members`);
}

export function removeWorkspaceMember(
  workspaceId: number,
  memberUserId: number,
) {
  return httpDelete<void>(`/workspaces/${workspaceId}/members/${memberUserId}`);
}

export function updateMemberRole(
  workspaceId: number,
  memberUserId: number,
  payload: updateMemberRolePayload,
) {
  return httpPatch<void>(
    `/workspaces/${workspaceId}/members/${memberUserId}/role`,
    payload,
  );
}

export function getWorkspacesChannels(id: number) {
  return httpGet<WorkspaceChannel[]>(`/workspaces/${id}/channels`);
}

export function createChannel(
  workspaceId: number,
  payload: CreateChannelPayload,
) {
  return httpPost<WorkspaceChannel>(
    `/workspaces/${workspaceId}/channels`,
    payload,
  );
}

// ─────────────────────────────────────────────
// Invite
// ─────────────────────────────────────────────

export function getIncomingInvites() {
  return httpGet<IncomingWorkspaceInvite[]>('/workspaces/invites/incoming');
}

export function inviteMember(
  workspaceId: number,
  payload: InviteMemberPayload,
) {
  return httpPost<WorkspaceInviteSummary>(
    `/workspaces/${workspaceId}/invites`,
    payload,
  );
}

export function getWorkspaceInvites(workspaceId: number) {
  return httpGet<WorkspaceInviteSummary[]>(
    `/workspaces/${workspaceId}/invites`,
  );
}

export function getInviteById(inviteId: string) {
  return httpGet<WorkspaceInviteDetail>(`/workspaces/invites/${inviteId}`);
}

export function getInviteByToken(token: string) {
  return httpGet<WorkspaceInviteDetail>(`/workspaces/invites/token/${token}`);
}

export function acceptInvite(inviteId: number) {
  return httpPost<{ workspaceId: number }>(
    `/workspaces/invites/${inviteId}/accept`,
  );
}

export function rejectInvite(inviteId: number) {
  return httpPost<void>(`/workspaces/invites/${inviteId}/reject`);
}

export function transferOwnership(
  workspaceId: number,
  payload: transferOwnershipPayload,
) {
  return httpPost<void>(
    `/workspaces/${workspaceId}/transfer-ownership`,
    payload,
  );
}
