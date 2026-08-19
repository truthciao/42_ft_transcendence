import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { createWorkspacePayload, UpdateWorkspacePayload, CreateChannelPayload, updateMemberRolePayload } from "@repo/shared-types";
import { createWorkspace, updateWorkspace, deleteWorkspace, leaveWorkspace, removeWorkspaceMember, updateMemberRole, createChannel } from "@/api/workspaces";
import { workspaceKeys } from "./useWorkspaces";

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: createWorkspacePayload) => createWorkspace(payload),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
      queryClient.setQueryData(workspaceKeys.detail(workspace.id), workspace);
    },
  });
}

export function useUpdateWorkspace(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWorkspacePayload) => updateWorkspace(id, payload),
    onSuccess: (workspace) => {
      queryClient.setQueryData(workspaceKeys.detail(id), workspace);
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    }
  })
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteWorkspace(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    }
  })
}

export function useLeaveWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => leaveWorkspace(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    }
  })
}


export function useRemoveWorkspaceMember(workspaceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberUserId: number) => removeWorkspaceMember(workspaceId, memberUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
    }
  })
}

export function useUpdateMemberRole(workspaceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberUserId, role} : { memberUserId: number } & updateMemberRolePayload) =>
      updateMemberRole(workspaceId, memberUserId, { role }),
    onSuccess:() => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId)});
    }
  })
}

export function useCreateChannel(workspaceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChannelPayload) => createChannel(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.channels(workspaceId)});
    }
  })
}
