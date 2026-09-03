import { Outlet, useParams } from 'react-router';
import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { Skeleton } from '../ui/skeleton';
import { HttpError } from '@/lib/http';
import { useWorkspace } from '@/hooks/useWorkspaces';
import { useTranslation } from 'react-i18next';

export function WorkspaceGuard() {
  const { workspaceId } = useParams();
  const id = Number(workspaceId);
  const { data, isLoading, isError, error } = useWorkspace(id);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const notFound =
    isError && error instanceof HttpError && error.status === 404;
  const forbidden =
    (isError && !notFound) || (!isLoading && !data?.myMembership);

  if (notFound) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title={t('workspaces.guard.notFoundTitle')}
        description={t('workspaces.guard.notFoundDescription')}
        className="mt-12"
      />
    );
  }

  if (forbidden) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title={t('workspaces.guard.forbiddenTitle')}
        description={t('workspaces.guard.forbiddenDescription')}
        className="mt-12"
      />
    );
  }

  return <Outlet />;
}
