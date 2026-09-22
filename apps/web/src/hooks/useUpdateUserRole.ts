import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { updateUserRole } from '../api/users';
import type { UserRole } from '@repo/shared-types';

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: UserRole }) =>
      updateUserRole(userId, role),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });

      toast.success(t('admin.messages.roleUpdated'));
    },

    onError: () => {
      toast.error(t('admin.messages.roleUpdateFailed'));
    },
  });
}
