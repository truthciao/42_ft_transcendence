import { useState, type SubmitEvent } from "react";
import { useParams, useNavigate } from "react-router";
import { Hash, Plus } from 'lucide-react';
import { useWorkspace, useWorkspaceChannels } from "@/hooks/useWorkspaces";
import { useCreateChannel } from "@/hooks/useWorkspaceMutations";
import { usePermission } from "@/hooks/usePermission";
import { PermissionButton } from "@/components/workspaces/PermissionButton";
import { PermissionGate } from "@/components/workspaces/PermissionGate";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SpaceDetailPage() {
  const { workspaceId } = useParams();
  const id = Number(workspaceId);
  const navigate = useNavigate();

  const { data: workspace, isLoading } = useWorkspace(id);
  const { data: channels, isLoading: channelsLoading } = useWorkspaceChannels(id);
  const { can } = usePermission(id);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <header className="mb-6 flex items-start gap-4">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-2xl">
          {workspace?.icon || '💻'}
        </span>
        <div>
          <h1 className="text-2xl font-semibold">{workspace?.name}</h1>
          {workspace?.description ? (
            <p className="mt-1 max-w-xl text-muted-foreground">{workspace.description}</p>
          ) : null}
        </div>
      </header>

      <PermissionGate workspaceId={id} minRole="ADMIN">
        <div className="mb-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Invite teammates to grow this workspace.
        </div>
      </PermissionGate>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Channels
          </h2>
          <PermissionButton
            allowed={can.createChannel}
            reason="Only admins and owner can create channels"
            size="sm"
            variant="outline"
            onClick={() => setCreateChannelOpen(true)}
          >
            <Plus className="size-4" /> New channel
          </PermissionButton>
        </div>

        {channelsLoading? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {channels?.map((channel) => (
              <button
                key = {channel.id}
                onClick={() => navigate(`/app/spaces/${id}/c/${channel.id}`)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-muted/50"
              >
                <Hash className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate">{channel.name}</span>
                <span className="text-xs text-muted-foreground">
                  {channel._count?.members ?? 0} members
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <CreateChannelDialog
        workspaceId={id}
        open={createChannelOpen}
        onOpenChange={setCreateChannelOpen}
      />
    </div>
  )
}

function CreateChannelDialog({
  workspaceId,
  open,
  onOpenChange,
}: {
  workspaceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mutation = useCreateChannel(workspaceId);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!/^[a-z0-9-_]+$/.test(name)) {
      setError('Use lowercase letters, numbers - and _ only');
      return;
    }

    try {
      await mutation.mutateAsync({name});
      toast.success(`#${name} created`);
      setName('');
      setError(null);
      onOpenChange(false);
    } catch {
      toast.error('Failed to create channel');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="general-discussion"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
