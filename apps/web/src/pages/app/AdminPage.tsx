import { Avatar } from '@/components/common/Avatar';
import { SkeletonListItem } from '@/components/common/Skeleton';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUpdateUserRole } from '@/hooks/useUpdateUserRole';
import { useConfirm } from '@/lib/confirm-context';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Trash2 } from 'lucide-react';
import type { UserRole } from '@repo/shared-types';

export function AdminPage() {
  const { data: users, isLoading } = useAdminUsers();
  const { mutate: updateRole } = useUpdateUserRole();
  const { t } = useTranslation();
  const { mutate: deleteUser } = useDeleteUser();
  const confirm = useConfirm();
  const { user: currentUser } = useAuth();
  const handleDeleteUser = async (userId: number) => {
    const confirmed = await confirm({
      title: t('admin.deleteUser.title'),
      description: t('admin.deleteUser.description'),
      confirmLabel: t('admin.deleteUser.confirm'),
      variant: 'destructive',
    });

    if (!confirmed) {
      return;
    }

    deleteUser(userId);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{t('admin.title')}</h1>
        <p className="text-muted-foreground">{t('admin.subtitle')}</p>
      </header>

      {isLoading ? (
        <div className="divide-y divide-border rounded-lg border border-border">
          <SkeletonListItem />
          <SkeletonListItem />
          <SkeletonListItem />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {users?.map((user) => (
            <div key={user.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar
                src={user.avatarUrl}
                name={user.displayName || user.username}
                size="sm"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {user.displayName || user.username}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{user.username} · {user.email}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                    />
                  }
                >
                  {t(`admin.roles.${user.role}`)}
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup
                    value={user.role}
                    onValueChange={(value) => {
                      if (value === user.role) {
                        return;
                      }

                      updateRole({
                        userId: user.id,
                        role: value as UserRole,
                      });
                    }}
                  >
                    <DropdownMenuRadioItem value="USER">
                      {t('admin.roles.USER')}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ADMIN">
                      {t('admin.roles.ADMIN')}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                disabled={user.id === currentUser?.id}
                onClick={() => handleDeleteUser(user.id)}
                aria-label={t('admin.deleteUser.confirm')}
                title={t('admin.deleteUser.confirm')}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
