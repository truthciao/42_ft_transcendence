import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UpdateProfilePayload } from '@repo/shared-types';
import { Avatar } from '@/components/common/Avatar';
import { PageError } from '@/components/common/PageError';
import { SkeletonText } from '@/components/common/Skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { toast } from 'sonner';

export function ProfilePage() {
  const { t, i18n } = useTranslation();

  const { data: profile, isLoading, isError, refetch } = useProfile();

  const [form, setForm] = useState<UpdateProfilePayload>({
    displayName: '',
    bio: '',
    avatarUrl: '',
    preferredLanguage: 'en',
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!profile || initialized) return;

    setForm({
      displayName: profile.displayName ?? '',
      bio: profile.bio ?? '',
      avatarUrl: profile.avatarUrl ?? '',
      preferredLanguage: profile.preferredLanguage ?? 'en',
    });

    setInitialized(true);

    if (
      profile.preferredLanguage &&
      profile.preferredLanguage !== i18n.language
    ) {
      void i18n.changeLanguage(profile.preferredLanguage);
    }
  }, [profile, i18n]);

  const mutation = useUpdateProfile();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    mutation.mutate(form, {
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
          <Avatar
            src={profile.avatarUrl}
            name={profile.displayName || profile.user?.username || '?'}
            size="xl"
          />

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

      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium">
            {t('profile.displayName')}
          </span>

          <input
            value={form.displayName}
            placeholder={t('profile.displayNamePlaceholder')}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                displayName: event.target.value,
              }))
            }
            className="rounded-md border border-input bg-background px-3 py-2"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">{t('profile.bio')}</span>

          <textarea
            rows={5}
            value={form.bio}
            placeholder={t('profile.bioPlaceholder')}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                bio: event.target.value,
              }))
            }
            className="resize-y rounded-md border border-input bg-background px-3 py-2"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">{t('profile.avatar')}</span>

          <input
            type="url"
            value={form.avatarUrl}
            placeholder={t('profile.avatarPlaceholder')}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                avatarUrl: event.target.value,
              }))
            }
            className="rounded-md border border-input bg-background px-3 py-2"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">
            {t('profile.preferredLanguage')}
          </span>

          <select
            value={form.preferredLanguage}
            onChange={(event) => {
              const language = event.target
                .value as UpdateProfilePayload['preferredLanguage'];

              setForm((prev) => ({
                ...prev,
                preferredLanguage: language,
              }));

              void i18n.changeLanguage(language);
            }}
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
