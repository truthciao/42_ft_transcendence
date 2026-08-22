import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getProfile, updateProfile, uploadAvatar } from '../api/profile';
import { useAuth } from '@/hooks/useAuth';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: updateProfile,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['profile'],
      });

      await refreshUser();
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: uploadAvatar,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['profile'],
      });

      await refreshUser();
    },
  });
}