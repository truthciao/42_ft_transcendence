import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { deleteUser } from '../api/users';

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users'],
      });

      toast.success(t('admin.messages.userDeleted'));
    },

    onError: () => {
      toast.error(t('admin.messages.userDeleteFailed'));
    },
  });
}
