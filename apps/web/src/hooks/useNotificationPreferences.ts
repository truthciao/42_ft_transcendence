import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationPreferences, updateNotificationPreferences } from '@/api/notifications';

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: getNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: unknown) => updateNotificationPreferences(prefs),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-preferences'] }),
  });
}
