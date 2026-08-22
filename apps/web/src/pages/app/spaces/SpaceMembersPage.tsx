import { useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceInvites, useWorkspaceMembers } from "@/hooks/useWorkspaces";
import { useRemoveWorkspaceMember, useUpdateMemberRole } from "@/hooks/useWorkspaceMutations";
import { usePermission } from "@/hooks/usePermission";
import { PermissionButton } from "@/components/workspaces/PermissionButton";
import { Avatar } from "@/components/common/Avatar";
import { SkeletonListItem } from "@/components/common/Skeleton";
import { useConfirm } from "@/lib/confirm-context";
import { toast } from "sonner";
import type { WorkspaceRole } from "@repo/shared-types";
import { UserPlus } from "lucide-react";
import { PermissionGate } from "@/components/workspaces/PermissionGate";
import { InviteMemberDialog } from "@/components/workspaces/InviteMemberDialog";

const ROLE_OPTIONS: WorkspaceRole[] = ['ADMIN', 'MEMBER']

export function SpaceMembersPage() {
  const { workspaceId } = useParams();
  const id = Number(workspaceId);
  const { user } = useAuth();
  const confirm = useConfirm();
  const [inviteOpen, setInviteOpen] = useState(false)

  const { data: members, isLoading } = useWorkspaceMembers(id);
  const { can } = usePermission(id);
  const removeMutation = useRemoveWorkspaceMember(id);
  const roleMutation = useUpdateMemberRole(id);

  async function handleRemove(memberUserId: number, username: string) {
    const confirmed = await confirm({
      title: `Remove ${username}?`,
      description: "They will lose access to this workspace and its channels.",
      variant: 'destructive',
    });
    if (!confirmed)
      return;

    try {
      await removeMutation.mutateAsync(memberUserId);
      toast.success(`${username} removed`);
    } catch {
      toast.error('Failed to remove member');
    }
  }

  async function handleRoleChange(memberUserId: number, role: WorkspaceRole) {
    try {
      await roleMutation.mutateAsync({memberUserId, role: role as 'ADMIN' | 'MEMBER'});
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Members</h1>
          <p className="text-muted-foreground">Manage who has access to this workspace.</p>
        </div>
        <PermissionButton
          allowed={can.inviteMember}
          reason="Only admins and owners can invite members"
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus className="size-4" /> Invite
        </PermissionButton>
      </header>

      {isLoading ? (
        <div className="divide-y divide-border rounded-lg border border-border">
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {members?.map((member) => {
            const isSelf = member.userId === user?.id;
            const isOwner = member.role === 'OWNER';

            return (
              <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar
                  src={member.user.profile?.avatarUrl ?? null}
                  name={member.user.profile?.displayName || member.user.username }
                  size="sm"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {member.user.profile?.displayName || member.user.username }
                    {isSelf ? <span className="ml-1.5 text-xs text-muted-foreground">(you)</span> : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">@{member.user.username}</p>
                </div>

                {isOwner ? (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">Owner</span>
                ) : can.changeMemberRole ? (
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    value={member.role}
                    onChange={(event) => handleRoleChange(member.userId, event.target.value as WorkspaceRole)}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{member.role}</span>
                )}

                <PermissionButton
                  allowed={can.removeMember && !isOwner && !isSelf}
                  reason={
                    isOwner
                      ? "The owner can't be removed"
                      : isSelf
                        ? 'Use "Leave workspace" in Settings instead'
                        : 'Only admins and owners can remove members'
                  }
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemove(member.userId, member.user.username)}
                >
                  Remove
                </PermissionButton>
              </div>
            );
          })}
        </div>
      )}

      <PermissionGate workspaceId={id} minRole="ADMIN">
        <PendingInvitesSection workspaceId={id} />
      </PermissionGate>

      <InviteMemberDialog workspaceId={id} open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}

function PendingInvitesSection({ workspaceId } : { workspaceId: number}) {
  const { data: invites, isLoading } = useWorkspaceInvites(workspaceId);
  const pending = invites?.filter((invite) => invite.status === 'PENDING') ?? [];

  if (isLoading || pending.length === 0)
    return null;

  return (
    <section className=" mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Pending invites
      </h2>
      <div className="divide-y divide-border rounded-lg border border-border">
        {pending.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className=" font-medium">
                {invite.invitee?.profile?.displayName || invite.invitee?.username || 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground">
                Invited by {invite.inviter.profile?.displayName || invite.inviter.username} · expires {' '}
                {new Date(invite.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              Pending
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
