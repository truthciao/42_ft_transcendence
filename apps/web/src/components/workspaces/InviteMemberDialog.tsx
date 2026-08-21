import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button} from "@/components/ui/button";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useWorkspaceMembers, useWorkspaceInvites } from "@/hooks/useWorkspaces";
import { useInviteMember } from "@/hooks/useWorkspaceMutations";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";


interface InviteMemberDialogProps {
  workspaceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({ workspaceId, open, onOpenChange }: InviteMemberDialogProps) {
  const { user: currentUser } = useAuth();
  const { role } = usePermission(workspaceId);
  const [username, setUsername] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');

  const { data: users = [], isLoading, isError } = useUserSearch(username);
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
  })

  function handleOpenChange(next: boolean) {
    if (!next) {
      setUsername('');
      setInviteRole('MEMBER');
    }
    onOpenChange(next);
  }

  async function handleInvite(userId: number) {
    try {
      await inviteMutation.mutateAsync({userId, role: inviteRole });
      toast.success('Invite sent');
    } catch {
      toast.error('Failed to send invite');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
        </DialogHeader>

        <div className=" space-y-4">
          <Input
            placeholder="Search by username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          {role === 'OWNER' ? (
            <div className="flex items-center gap-2 text-sm">
              <span className=" text-muted-foreground">Invite as</span>
              <select
                className=" rounded-md border border-input bg-background px-2 py-1 text-sm"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as 'ADMIN' | 'MEMBER')}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          ) : null }

          {username.trim().length < 2 ? (
            <p className=" text-sm text-muted-foreground">Enter at least 2 characters to search.</p>
          ) : isLoading ? (
            <p className=" text-sm text-muted-foreground">Searching...</p>
          ) : isError ? (
            <p className=" text-sm text-destructive">Failed to search users.</p>
          ) : availableUsers.length === 0 ? (
            <p className=" text-sm text-muted-foreground">No matching users to invite.</p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {availableUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
                  <span className="text-sm font-medium">{u.username}</span>
                  <Button size="sm" disabled={inviteMutation.isPending} onClick={() => handleInvite(u.id)}>
                    Invite
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  )

}
