import { type ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  profileFormSchema,
  type ProfileFormValues,
  type UpdateProfilePayload,
} from '@repo/shared-types';
import { Avatar } from '@/components/common/Avatar';
import { PageError } from '@/components/common/PageError';
import { SkeletonText } from '@/components/common/Skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
} from '../../hooks/useProfile';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export function ProfilePage() {
  const { t, i18n } = useTranslation();

  const { data: profile, isLoading, isError, refetch } = useProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      bio: '',
      preferredLanguage: 'en',
    },
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!profile || initialized) return;

    form.reset({
      displayName: profile.displayName ?? '',
      bio: profile.bio ?? '',
      preferredLanguage: profile.preferredLanguage,
    });

    setInitialized(true);

    if (
      profile.preferredLanguage &&
      profile.preferredLanguage !== i18n.language
    ) {
      void i18n.changeLanguage(profile.preferredLanguage);
    }
  }, [profile, i18n, form, initialized]);

  const mutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    uploadAvatarMutation.mutate(file, {
      onSuccess: () => {
        toast.success(t('profile.status.avatarUpdateSuccess'));
      },
      onError: () => {
        toast.error(t('profile.status.avatarUpdateError'));
      },
    });

    // 允许用户再次选择同一个文件
    event.target.value = '';
  }

  function handleSubmit(values: ProfileFormValues) {
    const payload: UpdateProfilePayload = {
      displayName: values.displayName === '' ? null : values.displayName,

      bio: values.bio === '' ? null : values.bio,

      preferredLanguage: values.preferredLanguage,
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t('profile.status.updateSuccess'));
      },
      onError: () => {
        toast.error(t('profile.status.updateError'));
      },
    });
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-xl space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1">
            <SkeletonText lines={2} />
          </div>
        </div>

        <SkeletonText lines={4} />
      </main>
    );
  }

  if (isError || !profile) {
    return <PageError onRetry={() => void refetch()} />;
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6">
      <header className="border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <Avatar
              src={profile.avatarUrl}
              name={profile.displayName || profile.user?.username || '?'}
              size="xl"
            />

            <label className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                disabled={uploadAvatarMutation.isPending}
              >
                <span>
                  {uploadAvatarMutation.isPending
                    ? t('profile.uploading')
                    : t('profile.changeAvatar')}
                </span>
              </Button>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadAvatarMutation.isPending}
              />
            </label>
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">{t('profile.title')}</h1>

            <p className="text-sm text-muted-foreground">
              {t('profile.description')}
            </p>

            {profile.user && (
              <p className="mt-2 text-sm text-muted-foreground">
                {t('profile.loggedInAs')}{' '}
                <span className="font-medium text-foreground">
                  {profile.user.username}
                </span>
              </p>
            )}
          </div>
        </div>
      </header>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium">
            {t('profile.displayName')}
          </span>

          <Input
            {...form.register('displayName')}
            placeholder={t('profile.displayNamePlaceholder')}
          />

          {form.formState.errors.displayName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.displayName.message}
            </p>
          )}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">{t('profile.bio')}</span>

          <textarea
            {...form.register('bio')}
            rows={5}
            placeholder={t('profile.bioPlaceholder')}
            className="resize-y rounded-md border border-input bg-background px-3 py-2"
          />

          {form.formState.errors.bio && (
            <p className="text-sm text-destructive">
              {form.formState.errors.bio.message}
            </p>
          )}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">
            {t('profile.preferredLanguage')}
          </span>

          <select
            {...form.register('preferredLanguage', {
              onChange: (event) => {
                void i18n.changeLanguage(event.target.value);
              },
            })}
            className="rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="en">{t('language.english')}</option>
            <option value="fr">{t('language.french')}</option>
            <option value="zh">{t('language.chinese')}</option>
          </select>
        </label>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </form>
    </main>
  );
}
