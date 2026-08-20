import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateWorkspaceSchema, type UpdateWorkspacePayload } from "@repo/shared-types";
import { useWorkspace } from "@/hooks/useWorkspaces";
import { useUpdateWorkspace, useDeleteWorkspace, useLeaveWorkspace } from "@/hooks/useWorkspaceMutations";
import { usePermission } from "@/hooks/usePermission";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/lib/confirm-context";
import { toast } from "sonner";
import { PermissionButton } from "@/components/workspaces/PermissionButton";

export function SpaceSettingPage() {
  const { workspaceId } = useParams();
  const id = Number(workspaceId);
  const navigate = useNavigate()
  const confirm = useConfirm();

  const { data: workspace, isLoading } = useWorkspace(id);
  const { can } = usePermission(id);
  const updateMutation = useUpdateWorkspace(id);
  const deleteMutation = useDeleteWorkspace();
  const leaveMutation = useLeaveWorkspace();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UpdateWorkspacePayload>({
    resolver: zodResolver(updateWorkspaceSchema),
  });

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        description: workspace.description ?? '',
        icon: workspace.icon ?? '',
      });
    }
  }, [workspace, reset])

  async function onSubmit(values: UpdateWorkspacePayload) {
    try {
      await updateMutation.mutateAsync(values);
      toast.success('Workspace updated')
    } catch {
      toast.error('Failed to update workspace')
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete "${workspace?.name}"?`,
      description: 'This permanently deletes the workspace, its channels and messages. This cannot be undone.',
      variant: 'destructive',
    });
    if (!confirmed)
      return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Workspace deleted');
      navigate('/app/spaces');
    } catch {
      toast.error('Failed to delete workspace');
    }
  }

  async function handleLeave() {
    const confirmed = await confirm ({
      title: 'Leave this workspace?',
      description: "You'll lose access to its channels and messages.",
      variant: 'destructive',
    });
    if (!confirmed)
      return;

    try {
      await leaveMutation.mutateAsync(id);
      toast.success('You left the workspace');
      navigate('/app/spaces');
    } catch {
      toast.error('Failed to leave workspace')
    }
  }

  if (isLoading || !workspace) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const isOwner = workspace.myMembership?.role === 'OWNER';

  return (
    <div className=" mx-auto max-w-xl space-y-8 p-6">
      <header>
        <h1 className=" text-2xl font-semibold">Workspace settings</h1>
        <p className=" text-muted-foreground">Manage details for {workspace.name}.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className=" space-y-4 rounded-lg border border-border p-4">
        <fieldset disabled={!can.updateWorkspace} className="space-y-4">
          <div className=" space-y-1.5">
            <label className="text-sm font-medium" htmlFor="settings-name">Name</label>
            <Input id="settings-name" {...register('name')} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="settings-description">Description</label>
            <textarea
              id="settings-description"
              rows={3}
              className="w-full resize-y rounded-md border border-input bg-background px-2.5 py-1.5 text-sm disabled:opacity-50"
              {...register('description')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="settings-icon">Icon</label>
            <Input id="settings-icon" maxLength={4} className="w-20" {...register('icon')} />
          </div>
        </fieldset>

        {!can.updateWorkspace ? (
          <p className="text-xs text-muted-foreground">Only admins and owners can edit workspace details.</p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={!can.updateWorkspace || !isDirty || isSubmitting} >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>

      <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
        <h2 className="font-semibold text-destructive">Danger zone</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Leave workspace</p>
            <p className="text-xs text-muted-foreground">
              {isOwner ? "Transfer ownership before leaving." : "You'll lose access immediately."}
            </p>
          </div>
          <PermissionButton
            allowed={!isOwner}
            reason="Owner must transfer ownership before leaving"
            variant="outline"
            onClick={handleLeave}
          >
            Leave
          </PermissionButton>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete workspace</p>
            <p className="text-xs text-muted-foreground">Permanently delete this workspace and all its data.</p>
          </div>
          <PermissionButton
            allowed={can.deleteWorkspace}
            reason="Only the owner can delete this workspace"
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </PermissionButton>
        </div>
      </div>
    </div>
  )
}
