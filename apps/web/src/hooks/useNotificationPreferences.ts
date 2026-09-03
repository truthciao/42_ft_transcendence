import type { UpdateNotificationPreferences } from '@repo/shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/api/notifications';

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: getNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      prefs: UpdateNotificationPreferences['preferences'],
    ) => updateNotificationPreferences(prefs),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ['notification-preferences'],
      }),
  });
}
