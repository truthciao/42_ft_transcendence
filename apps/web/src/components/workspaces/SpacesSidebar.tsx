import { NavLink, useParams } from "react-router";
import { Hash, Plus, Settings, Users } from "lucide-react";
import { useState } from "react";
import { useWorkspace, useWorkspaces, useWorkspaceChannels, usePrefetchWorkspace } from "@/hooks/useWorkspaces";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

export function SpacesSidebar() {
  const { workspaceId } = useParams();
  const id = workspaceId ? Number(workspaceId) : undefined;

  if (id !== undefined) {
    return <WorkspaceNavSidebar workspaceId={id} />;
  }
  return <WorkspaceDirectorySidebar />;
}

function WorkspaceDirectorySidebar() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const prefetchWorkspace = usePrefetchWorkspace();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Spaces</h3>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Create workspace"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      ) : !workspaces || workspaces.length === 0 ? (
        <p className="text-sm text-muted-foreground">You're not in any workspace yet.</p>
      ) : (
        <div className="space-y-1">
          {workspaces.map((workspace) => (
            <NavLink
              key={workspace.id}
              to={`/app/spaces/${workspace.id}`}
              onMouseEnter={() => prefetchWorkspace(workspace.id)}
              className={({ isActive }) =>
                cn('flex items-center gap-2 rounded-md px-2 py-2 text-sm',
                  isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-muted',
                )
              }
              >
                <span className="text-base">{workspace.icon || '💻'}</span>
                <span className="truncate">{workspace.name}</span>
            </NavLink>
          ))}
        </div>
      )}

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

function WorkspaceNavSidebar({ workspaceId }: { workspaceId: number}) {
  const { data: workspace } = useWorkspace(workspaceId);
  const { data: channels, isLoading } = useWorkspaceChannels(workspaceId);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex min-w-0 items-center gap-2">
        <span className="text-lg">{workspace?.icon || '💻'}</span>
        <h3 className="truncate font-semibold">{workspace?.name ?? 'Loading'}</h3>
      </div>

      <nav className="mb-4 space-y-1">
        <NavLink
          to={`/app/spaces/${workspaceId}`}
          end
          className={({ isActive} ) =>
            cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm', isActive ? 'bg-muted font-medium' : 'hover:bg-muted')
          }
        >
          <Hash className="size-4" /> Overview
        </ NavLink>

        <NavLink
          to={`/app/spaces/${workspaceId}/members`}
          className={({ isActive} ) =>
            cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm', isActive ? 'bg-muted font-medium' : 'hover:bg-muted')
          }
        >
          <Users className="size-4" /> Members
        </NavLink>

        <NavLink
          to={`/app/spaces/${workspaceId}/settings`}
          className={({ isActive }) =>
            cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm', isActive ? 'bg-muted font-medium' : 'hover:bg-muted')
          }
        >
          <Settings className="size-4" /> Settings
        </NavLink>
      </nav>

      <div className="min-h-0 flex-1 overflow-auto">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Channels
          </p>
          {isLoading ? (
            <div className="space-y1.5 px-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div className="space-y-1">
              {channels?.map((channel) => (
                <NavLink
                  key={channel.id}
                  to={`/app/spaces/${workspaceId}/c/${channel.id}`}
                  className={({ isActive }) =>
                    cn('flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground',
                      isActive? 'bg-muted font-medium text-foreground' : 'hover: bg-muted',
                    )
                  }
                >
                  <Hash className="size-3.5" />
                  <span className="truncate">{channel.name}</span>
                </NavLink>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
