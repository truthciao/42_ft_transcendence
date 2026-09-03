import { useNavigate } from 'react-router';
import { useIncomingInvites } from '@/hooks/useWorkspaces';
import {
  useAcceptInvite,
  useRejectInvite,
} from '@/hooks/useWorkspaceMutations';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function IncomingInvitesList() {
  const { data: invites, isLoading } = useIncomingInvites();
  const acceptMutation = useAcceptInvite();
  const rejectMutation = useRejectInvite();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const pending =
    invites?.filter((invite) => invite.status === 'PENDING') ?? [];

  if (isLoading || pending.length === 0) return null;

  async function handleAccept(inviteId: number) {
    try {
      const result = await acceptMutation.mutateAsync(inviteId);
      toast.success(t('workspaces.invites.acceptSuccess'));
      navigate(`/app/spaces/${result.workspaceId}`);
    } catch {
      toast.error(t('workspaces.invites.acceptError'));
    }
  }

  async function handleReject(inviteId: number) {
    try {
      await rejectMutation.mutateAsync(inviteId);
      toast.success(t('workspaces.invites.rejectSuccess'));
    } catch {
      toast.error(t('workspaces.invites.rejectError'));
    }
  }

  return (
    <section className="mb-6 space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t('workspaces.invites.title')}
      </h2>
      <div className="divide-y divide-border rounded-lg border border-border">
        {pending.map((invite) => (
          <div
            key={invite.id}
            className=" flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {invite.workspace.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {t('workspaces.invites.invitedBy', {
                  name:
                    invite.inviter.profile?.displayName ||
                    invite.inviter.username,
                  role: t(`workspaces.roles.${invite.role}`),
                })}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={rejectMutation.isPending}
                onClick={() => handleReject(invite.id)}
              >
                {t('workspaces.invites.decline')}
              </Button>
              <Button
                size="sm"
                disabled={acceptMutation.isPending}
                onClick={() => handleAccept(invite.id)}
              >
                {t('workspaces.invites.accept')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
