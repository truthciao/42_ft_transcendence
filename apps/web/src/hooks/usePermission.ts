import { useMemo } from 'react';
import { atLeastRole, type WorkspaceRole } from '@repo/shared-types';
import { useWorkspace } from './useWorkspaces';

export interface WorkspacePermissions {
  role: WorkspaceRole | null;
  isMember: boolean;
  isLoading: boolean;
  hasRole: (min: WorkspaceRole, strict?: boolean) => boolean;
  can: {
    updateWorkspace: boolean;
    deleteWorkspace: boolean;
    deleteDocument: boolean;
    inviteMember: boolean;
    removeMember: boolean;
    changeMemberRole: boolean;
    createChannel: boolean;
    leaveWorkspace: boolean;
    transferOwnership: boolean;
  };
}

export function usePermission(
  workspaceId: number | undefined,
): WorkspacePermissions {
  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  const role = workspace?.myMembership?.role ?? null;

  return useMemo(() => {
    function hasRole(min: WorkspaceRole, strict = false): boolean {
      if (!role) return false;
      return atLeastRole(role, min, strict);
    }

    return {
      role,
      isMember: role !== null,
      isLoading,
      hasRole,
      can: {
        updateWorkspace: hasRole('ADMIN'),
        deleteWorkspace: hasRole('OWNER'),
        deleteDocument: hasRole('ADMIN'),
        inviteMember: hasRole('ADMIN'),
        removeMember: hasRole('ADMIN'),
        changeMemberRole: hasRole('OWNER'),
        createChannel: hasRole('ADMIN'),
        leaveWorkspace: role !== null && role !== 'OWNER',
        transferOwnership: hasRole('OWNER'),
      },
    };
  }, [role, isLoading]);
}
