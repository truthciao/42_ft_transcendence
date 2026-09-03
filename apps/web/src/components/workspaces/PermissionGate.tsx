import type { ReactNode } from 'react';
import type { WorkspaceRole } from '@repo/shared-types';
import { usePermission } from '@/hooks/usePermission';

interface PermissionGateProps {
  workspaceId: number | undefined;
  minRole: WorkspaceRole;
  strict?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  workspaceId,
  minRole,
  strict,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasRole, isLoading } = usePermission(workspaceId);

  if (isLoading) return null;
  if (!hasRole(minRole, strict)) return <>{fallback}</>;
  return <>{children}</>;
}
