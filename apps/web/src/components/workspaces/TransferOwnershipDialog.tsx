import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWorkspaceMembers } from '@/hooks/useWorkspaces';
import { useTransferOwnership } from '@/hooks/useWorkspaceMutations';
import { useConfirm } from '@/lib/confirm-context';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface TransferOwnershipDialogProps {
  workspaceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferOwnershipDialog({
  workspaceId,
  open,
  onOpenChange,
}: TransferOwnershipDialogProps) {
  const { data: members } = useWorkspaceMembers(workspaceId);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const mutation = useTransferOwnership(workspaceId);
  const confirm = useConfirm();
  const { t } = useTranslation();

  const candidates = members?.filter((m) => m.role !== 'OWNER') ?? [];

  function handleOpenChange(next: boolean) {
    if (!next) setSelectedUserId(null);
    onOpenChange(next);
  }

  async function handleTransfer() {
    if (selectedUserId === null) return;
    const target = candidates.find((m) => m.userId === selectedUserId);

    const confirmed = await confirm({
      title: t('workspaces.transferOwnership.confirmTitle', {
        name: target?.user.username,
      }),
      description: t('workspaces.transferOwnership.confirmDescription'),
      variant: 'destructive',
    });
    if (!confirmed) return;

    try {
      await mutation.mutateAsync({ targetUserId: selectedUserId });
      toast.success(t('workspaces.transferOwnership.success'));
      handleOpenChange(false);
    } catch {
      toast.error(t('workspaces.transferOwnership.error'));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('workspaces.transferOwnership.title')}</DialogTitle>
        </DialogHeader>

        {candidates.length === 0 ? (
          <p className=" text-sm text-muted-foreground">
            {t('workspaces.transferOwnership.noCandidates')}
          </p>
        ) : (
          <div className=" max-h-64 space-y-1 overflow-y-auto">
            {candidates.map((member) => (
              <label
                key={member.id}
                className=" flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-muted"
              >
                <input
                  type="radio"
                  name="transfer-target"
                  checked={selectedUserId === member.userId}
                  onChange={() => setSelectedUserId(member.userId)}
                />
                <span className="text-sm">
                  {member.user.profile?.displayName || member.user.username}
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({member.role})
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            disabled={selectedUserId === null || mutation.isPending}
            onClick={handleTransfer}
          >
            {mutation.isPending
              ? t('workspaces.transferOwnership.transferring')
              : t('workspaces.transferOwnership.transfer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
