import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserSearch } from '@/hooks/useUserSearch';
import {
  useWorkspaceMembers,
  useWorkspaceInvites,
} from '@/hooks/useWorkspaces';
import { useInviteMember } from '@/hooks/useWorkspaceMutations';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface InviteMemberDialogProps {
  workspaceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({
  workspaceId,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const { user: currentUser } = useAuth();
  const { role } = usePermission(workspaceId);

  const [username, setUsername] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const { t } = useTranslation();

  const { data: searchResult, isLoading, isError } = useUserSearch(username);

  const users = searchResult?.pages.flatMap((page) => page.users) ?? [];

  const { data: members } = useWorkspaceMembers(workspaceId);
  const { data: pendingInvites } = useWorkspaceInvites(workspaceId);

  const inviteMutation = useInviteMember(workspaceId);

  const memberIds = new Set(members?.map((m) => m.userId) ?? []);

  const invitedIds = new Set(
    (pendingInvites ?? [])
      .filter((invite) => invite.status === 'PENDING')
      .map((invite) => invite.invitee?.id)
      .filter((id): id is number => id !== undefined),
  );

  const availableUsers = users.filter((u) => {
    if (u.id === currentUser?.id) return false;
    if (memberIds.has(u.id)) return false;
    if (invitedIds.has(u.id)) return false;

    return true;
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      setUsername('');
      setInviteRole('MEMBER');
    }

    onOpenChange(next);
  }

  async function handleInvite(userId: number) {
    try {
      await inviteMutation.mutateAsync({
        userId,
        role: inviteRole,
      });

      toast.success(t('workspaces.inviteMember.success'));
    } catch {
      toast.error(t('workspaces.inviteMember.error'));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('workspaces.inviteMember.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder={t('workspaces.inviteMember.searchPlaceholder')}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          {role === 'OWNER' ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {t('workspaces.inviteMember.inviteAs')}
              </span>

              <select
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                value={inviteRole}
                onChange={(event) =>
                  setInviteRole(event.target.value as 'ADMIN' | 'MEMBER')
                }
              >
                <option value="MEMBER">{t('workspaces.roles.MEMBER')}</option>
                <option value="ADMIN">{t('workspaces.roles.ADMIN')}</option>
              </select>
            </div>
          ) : null}

          {username.trim().length < 2 ? (
            <p className="text-sm text-muted-foreground">
              {t('workspaces.inviteMember.minCharacters')}
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t('workspaces.inviteMember.searching')}
            </p>
          ) : isError ? (
            <p className="text-sm text-destructive">
              {t('workspaces.inviteMember.searchError')}
            </p>
          ) : availableUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('workspaces.inviteMember.noMatchingUsers')}
            </p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {availableUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted"
                >
                  <span className="text-sm font-medium">{u.username}</span>

                  <Button
                    size="sm"
                    disabled={inviteMutation.isPending}
                    onClick={() => handleInvite(u.id)}
                  >
                    {t('workspaces.inviteMember.invite')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('workspaces.inviteMember.done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
