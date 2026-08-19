import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/Skeleton";
import { Button } from "@base-ui/react";
import { CreateWorkspaceDialog } from "@/components/workspaces/CreateWorkspaceDialog";

export function SpacesIndexPage() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Spaces</h2>
          <p className="mt-1 text-muted-foreground">Workspaces you're a part of.</p>
        </div>
      </header>
      <Button onClick={() => setCreateOpen(true)}>
        <Plus className="size-4" /> New workspace
      </Button>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ): !workspaces || workspaces.length === 0 ? (
        <EmptyState
          title="No workspaces yet"
          description="Create a workspace to start organizing channels and teammates."
          action={{ label: 'Create workspace', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <button
             key={workspace.id}
             onClick={() => navigate(`/app/spaces/${workspace.id}`)}
             className="flex flex-col gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-lg">
                  {workspace.icon || '💻'}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{workspace.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {workspace.myMembership?.role ?? 'MEMBER'}
                  </p>
                </div>
              </div>
              {workspace.description ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{workspace.description}</p>
              ) : null }
            </button>
          ))}
        </div>
      )}

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
