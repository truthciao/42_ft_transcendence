import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkspace, getWorkspaces, getWorkspaceMembers, getWorkspacesChannels } from "@/api/workspaces";

export const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (id: number) => ['workspace', id] as const,
  members: (id: number) => ['workspace', id, 'members'] as const,
  channels: (id: number) => ['workspace', id, 'channels'] as const,
 }

 export function useWorkspaces() {
  return useQuery({ queryKey: workspaceKeys.all, queryFn: getWorkspaces })
 }

 export function useWorkspace(id: number | undefined) {
  return useQuery({
    queryKey: workspaceKeys.detail(id ?? -1),
    queryFn: () => getWorkspace(id as number),
    enabled: id !== undefined && Number.isInteger(id),
  })
 }

export function usePrefetchWorkspace() {
  const queryClient = useQueryClient();
  return (id: number) => queryClient.prefetchQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => getWorkspace(id),
    staleTime: 30_000,
  });
}

export function useWorkspaceMembers(id: number | undefined) {
  return useQuery({
    queryKey: workspaceKeys.members(id ?? -1),
    queryFn: () => getWorkspaceMembers(id as number),
    enabled: id !== undefined && Number.isInteger(id),
  });
}

export function useWorkspaceChannels(id: number | undefined) {
  return useQuery({
    queryKey: workspaceKeys.channels(id ?? -1),
    queryFn: () => getWorkspacesChannels(id as number),
    enabled: id !== undefined && Number.isInteger(id),
  })
}

