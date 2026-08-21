import { useNavigate } from "react-router";
import { useIncomingInvites } from "@/hooks/useWorkspaces";
import { useAcceptInvite, useRejectInvite } from "@/hooks/useWorkspaceMutations";
import { Button} from "@/components/ui/button";
import { toast } from "sonner";

export function IncomingInvitesList() {
  const { data: invites, isLoading } = useIncomingInvites();
  const acceptMutation = useAcceptInvite();
  const rejectMutation = useRejectInvite();
  const navigate = useNavigate();

  const pending = invites?.filter((invite) => invite.status === 'PENDING') ?? [];

  if (isLoading || pending.length === 0)
    return null;

  async function handleAccept(inviteId: number) {
    try {
      const result = await acceptMutation.mutateAsync(inviteId);
      toast.success('Invite accepted');
      navigate(`/app/spaces/${result.WorkspaceId}`);
    } catch {
      toast.error('Failed to accept invite');
    }
  }

  async function handleReject(inviteId: number) {
    try {
      await rejectMutation.mutateAsync(inviteId);
      toast.success('Invite declined');
    } catch {
      toast.error('Failed to decline invite');
    }
  }

  return (
    <section className="mb-6 space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Invitations
      </h2>
      <div className="divide-y divide-border rounded-lg border border-border">
        {pending.map((invite) => (
          <div key={invite.id} className=" flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{invite.workspace.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                Invited by {invite.inviter.profile?.displayName || invite.inviter.username} · as{' '}
                {invite.role.toLowerCase()}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" disabled={rejectMutation.isPending} onClick={() => handleReject(invite.id)}>
                Decline
              </Button>
              <Button size="sm" disabled={acceptMutation.isPending} onClick={() => handleAccept(invite.id)}>
                Accept
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
