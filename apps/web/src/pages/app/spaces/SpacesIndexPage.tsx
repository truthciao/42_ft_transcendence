import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/Skeleton";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceDialog } from "@/components/workspaces/CreateWorkspaceDialog";
import { IncomingInvitesList } from "@/components/workspaces/IncomingInvitesList";
import { useTranslation } from "react-i18next";

export function SpacesIndexPage() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="h-full overflow-y-auto p-6">
      <IncomingInvitesList />
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t('workspaces.pages.index.title')}</h2>
          <p className="mt-1 text-muted-foreground">{t('workspaces.pages.index.subtitle')}</p>
        </div>
      </header>
      <Button onClick={() => setCreateOpen(true)}>
        <Plus className="size-4" /> {t('workspaces.pages.index.newWorkspace')}
      </Button>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ): !workspaces || workspaces.length === 0 ? (
        <EmptyState
          title={t('workspaces.pages.index.emptyTitle')}
          description={t('workspaces.pages.index.emptyDesc')}
          action={{ label: t('workspaces.pages.index.createWorkspace'), onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Button
              key={workspace.id}
              type="button"
              variant="outline"
              className="h-auto w-full flex-col items-stretch gap-3 p-4 text-left"
              onClick={() => navigate(`/app/spaces/${workspace.id}`)}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-lg">
                  {workspace.icon || '💻'}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{workspace.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {workspace.myMembership?.role ? `${workspace.myMembership.role}` : t('workspaces.inviteMember.roles.MEMBER')}
                  </p>
                </div>
              </div>
              {workspace.description ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{workspace.description}</p>
              ) : null }
            </Button>
          ))}
        </div>
      )}

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
