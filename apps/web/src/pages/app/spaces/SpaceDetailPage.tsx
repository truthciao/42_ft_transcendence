import { useState, type SubmitEvent } from "react";
import { useParams, useNavigate } from "react-router";
import { FileText, Hash, Plus } from 'lucide-react';
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
import { useTranslation } from "react-i18next";
import { useWorkspaceDocuments, useCreateDocument } from '@/hooks/useDocuments';

export function SpaceDetailPage() {
  const { workspaceId } = useParams();
  const id = Number(workspaceId);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: workspace, isLoading } = useWorkspace(id);
  const { data: channels, isLoading: channelsLoading } = useWorkspaceChannels(id);
  const { data: documents, isLoading: documentsLoading } = useWorkspaceDocuments(id);
  const createDocumentMutation = useCreateDocument(id);
  const { can } = usePermission(id);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false);

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
          {t('workspaces.pages.detail.inviteTeammates')}
        </div>
      </PermissionGate>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('workspaces.pages.detail.channels')}
          </h2>
          <PermissionButton
            allowed={can.createChannel}
            reason={t('workspaces.pages.detail.newChannelTooltip')}
            size="sm"
            variant="outline"
            onClick={() => setCreateChannelOpen(true)}
          >
            <Plus className="size-4" /> {t('workspaces.pages.detail.newChannel')}
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
                  {t('workspaces.pages.detail.membersCount', { count: channel._count?.members ?? 0 })}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('workspaces.pages.detail.documents')}
          </h2>

          <Button
            size="sm"
            variant="outline"
            disabled={createDocumentMutation.isPending}
            onClick={() => setCreateDocumentOpen(true)}
          >
            <Plus className="size-4" />
            {t('workspaces.pages.detail.newDocument')}
          </Button>
        </div>

        {documentsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {documents?.map((document) => (
              <button
                key={document.id}
                onClick={() =>
                  navigate(
                    `/app/spaces/${id}/documents/${document.id}`,
                  )
                }
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-muted/50"
              >
                <FileText className="size-4 text-muted-foreground" />

                <span className="flex-1 truncate">
                  {document.title ||
                    t('workspaces.pages.detail.untitledDocument')}
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
      <CreateDocumentDialog
        workspaceId={id}
        open={createDocumentOpen}
        onOpenChange={setCreateDocumentOpen}
        onCreated={(documentId) =>
          navigate(`/app/spaces/${id}/documents/${documentId}`)
        }
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
  const { t } = useTranslation();

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!/^[a-z0-9-_]+$/.test(name)) {
      setError(t('workspaces.pages.detail.createChannel.nameError'));
      return;
    }

    try {
      await mutation.mutateAsync({name});
      toast.success(t('workspaces.pages.detail.createChannel.success', { name }));
      setName('');
      setError(null);
      onOpenChange(false);
    } catch {
      toast.error(t('workspaces.pages.detail.createChannel.error'));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('workspaces.pages.detail.createChannel.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder={t('workspaces.pages.detail.createChannel.placeholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t('workspaces.pages.detail.createChannel.submitting') : t('workspaces.pages.detail.createChannel.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CreateDocumentDialog({
  workspaceId,
  open,
  onOpenChange,
  onCreated,
}: {
  workspaceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (documentId: number) => void;
}) {
  const [title, setTitle] = useState('');
  const mutation = useCreateDocument(workspaceId);
  const { t } = useTranslation();

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    try {
      const document = await mutation.mutateAsync({
        title: trimmedTitle,
      });

      setTitle('');
      onOpenChange(false);

      toast.success(
        t('workspaces.pages.detail.createDocument.success'),
      );

      onCreated(document.id);
    } catch {
      toast.error(
        t('workspaces.pages.detail.createDocument.error'),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('workspaces.pages.detail.createDocument.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder={t(
              'workspaces.pages.detail.createDocument.placeholder',
            )}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('workspaces.pages.detail.createDocument.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={mutation.isPending || !title.trim()}
            >
              {mutation.isPending
                ? t(
                    'workspaces.pages.detail.createDocument.creating',
                  )
                : t(
                    'workspaces.pages.detail.createDocument.create',
                  )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}