import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateWorkspaceSchema,
  type UpdateWorkspacePayload,
} from '@repo/shared-types';
import { useWorkspace } from '@/hooks/useWorkspaces';
import {
  useUpdateWorkspace,
  useDeleteWorkspace,
  useLeaveWorkspace,
} from '@/hooks/useWorkspaceMutations';
import { usePermission } from '@/hooks/usePermission';
import { useWorkspaceDocuments, useDeleteDocument } from '@/hooks/useDocuments';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useConfirm } from '@/lib/confirm-context';
import { toast } from 'sonner';
import { PermissionButton } from '@/components/workspaces/PermissionButton';
import { TransferOwnershipDialog } from '@/components/workspaces/TransferOwnershipDialog';
import { useTranslation } from 'react-i18next';

export function SpaceSettingPage() {
  const { workspaceId } = useParams();
  const id = Number(workspaceId);
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { t } = useTranslation();

  const { data: workspace, isLoading } = useWorkspace(id);
  const { can } = usePermission(id);
  const updateMutation = useUpdateWorkspace(id);
  const deleteMutation = useDeleteWorkspace();
  const leaveMutation = useLeaveWorkspace();
  const [transferOpen, setTransferOpen] = useState(false);
  const { data: documents } = useWorkspaceDocuments(id);
  const deleteDocumentMutation = useDeleteDocument(id);

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
  }, [workspace, reset]);

  async function onSubmit(values: UpdateWorkspacePayload) {
    try {
      await updateMutation.mutateAsync(values);
      toast.success(t('workspaces.pages.settings.updateSuccess'));
    } catch {
      toast.error(t('workspaces.pages.settings.updateError'));
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: t('workspaces.pages.settings.dangerZone.delete.confirmTitle', {
        name: workspace?.name,
      }),
      description: t('workspaces.pages.settings.dangerZone.delete.confirmDesc'),
      variant: 'destructive',
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t('workspaces.pages.settings.dangerZone.delete.success'));
      navigate('/app/spaces');
    } catch {
      toast.error(t('workspaces.pages.settings.dangerZone.delete.error'));
    }
  }

  async function handleLeave() {
    const confirmed = await confirm({
      title: t('workspaces.pages.settings.dangerZone.leave.confirmTitle'),
      description: t('workspaces.pages.settings.dangerZone.leave.confirmDesc'),
      variant: 'destructive',
    });
    if (!confirmed) return;

    try {
      await leaveMutation.mutateAsync(id);
      toast.success(t('workspaces.pages.settings.dangerZone.leave.success'));
      navigate('/app/spaces');
    } catch {
      toast.error(t('workspaces.pages.settings.dangerZone.leave.error'));
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

  async function handleDeleteDocument(documentId: number) {
    const document = documents?.find((item) => item.id === documentId);

    if (!document) {
      return;
    }

    const confirmed = await confirm({
      title: t('workspaces.pages.settings.dangerZone.document.confirmTitle', {
        name: document.title,
      }),
      description: t(
        'workspaces.pages.settings.dangerZone.document.confirmDesc',
      ),
      variant: 'destructive',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteDocumentMutation.mutateAsync(documentId);

      toast.success(t('workspaces.pages.settings.dangerZone.document.success'));
    } catch {
      toast.error(t('workspaces.pages.settings.dangerZone.document.error'));
    }
  }

  const isOwner = workspace.myMembership?.role === 'OWNER';

  return (
    <div className=" mx-auto max-w-xl space-y-8 p-6">
      <header>
        <h1 className=" text-2xl font-semibold">
          {t('workspaces.pages.settings.title')}
        </h1>
        <p className=" text-muted-foreground">
          {t('workspaces.pages.settings.subtitle', { name: workspace.name })}
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" space-y-4 rounded-lg border border-border p-4"
      >
        <fieldset disabled={!can.updateWorkspace} className="space-y-4">
          <div className=" space-y-1.5">
            <label className="text-sm font-medium" htmlFor="settings-name">
              {t('workspaces.pages.settings.form.name')}
            </label>
            <Input id="settings-name" {...register('name')} />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              htmlFor="settings-description"
            >
              {t('workspaces.pages.settings.form.description')}
            </label>
            <textarea
              id="settings-description"
              rows={3}
              className="w-full resize-y rounded-md border border-input bg-background px-2.5 py-1.5 text-sm disabled:opacity-50"
              {...register('description')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="settings-icon">
              {t('workspaces.pages.settings.form.icon')}
            </label>
            <Input
              id="settings-icon"
              maxLength={4}
              className="w-20"
              {...register('icon')}
            />
          </div>
        </fieldset>

        {!can.updateWorkspace ? (
          <p className="text-xs text-muted-foreground">
            {t('workspaces.pages.settings.form.unauthorized')}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!can.updateWorkspace || !isDirty || isSubmitting}
          >
            {isSubmitting
              ? t('workspaces.pages.settings.form.saving')
              : t('workspaces.pages.settings.form.save')}
          </Button>
        </div>
      </form>

      <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
        <h2 className="font-semibold text-destructive">
          {t('workspaces.pages.settings.dangerZone.title')}
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {t('workspaces.pages.settings.dangerZone.leave.title')}
            </p>
            <p className="text-xs text-muted-foreground">
              {isOwner
                ? t('workspaces.pages.settings.dangerZone.leave.ownerDesc')
                : t('workspaces.pages.settings.dangerZone.leave.memberDesc')}
            </p>
          </div>
          <PermissionButton
            allowed={!isOwner}
            reason={t('workspaces.pages.settings.dangerZone.leave.tooltip')}
            variant="outline"
            onClick={handleLeave}
          >
            {t('workspaces.pages.settings.dangerZone.leave.button')}
          </PermissionButton>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {t('workspaces.pages.settings.dangerZone.transfer.title')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('workspaces.pages.settings.dangerZone.transfer.desc')}
            </p>
          </div>
          <PermissionButton
            allowed={can.transferOwnership}
            reason={t('workspaces.pages.settings.dangerZone.transfer.tooltip')}
            variant="outline"
            onClick={() => setTransferOpen(true)}
          >
            {t('workspaces.pages.settings.dangerZone.transfer.button')}
          </PermissionButton>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">
              {t('workspaces.pages.settings.dangerZone.document.title')}
            </p>

            <p className="text-xs text-muted-foreground">
              {t('workspaces.pages.settings.dangerZone.document.desc')}
            </p>
          </div>

          {documents?.length ? (
            <div className="space-y-2">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <p className="truncate text-sm font-medium">
                    {document.title || 'Untitled'}
                  </p>

                  <PermissionButton
                    allowed={can.deleteDocument}
                    reason={t(
                      'workspaces.pages.settings.dangerZone.document.tooltip',
                    )}
                    variant="destructive"
                    disabled={deleteDocumentMutation.isPending}
                    onClick={() => void handleDeleteDocument(document.id)}
                  >
                    {t('workspaces.pages.settings.dangerZone.document.button')}
                  </PermissionButton>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('workspaces.pages.settings.dangerZone.document.empty')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {t('workspaces.pages.settings.dangerZone.delete.title')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('workspaces.pages.settings.dangerZone.delete.desc')}
            </p>
          </div>
          <PermissionButton
            allowed={can.deleteWorkspace}
            reason={t('workspaces.pages.settings.dangerZone.delete.tooltip')}
            variant="destructive"
            onClick={handleDelete}
          >
            {t('workspaces.pages.settings.dangerZone.delete.button')}
          </PermissionButton>
        </div>
      </div>

      <TransferOwnershipDialog
        workspaceId={id}
        open={transferOpen}
        onOpenChange={setTransferOpen}
      />
    </div>
  );
}
