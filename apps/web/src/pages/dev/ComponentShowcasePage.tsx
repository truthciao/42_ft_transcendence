import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { EmptyState } from '@/components/common/EmptyState';
import {
  SkeletonAvatar,
  SkeletonCard,
  SkeletonMessageList,
  SkeletonText,
} from '@/components/common/Skeleton';
import { PageError } from '@/components/common/PageError';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/lib/confirm-context';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-b border-border pb-8 last:border-b-0">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
      <div className="rounded-lg border border-border bg-card p-6">{children}</div>
    </section>
  );
}

export function ComponentShowcasePage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [showError, setShowError] = useState(false);

  async function handleConfirmDemo() {
    const confirmed = await confirm({
      title: t('showcase.confirmTitle'),
      description: t('showcase.confirmDescription'),
      variant: 'destructive',
    });
    toast(confirmed ? t('showcase.confirmed') : t('showcase.cancelled'));
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold">{t('showcase.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('showcase.description')}</p>
      </div>

      <Section title="Avatar">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar name="Yali Chen" size="sm" status="online" />
          <Avatar name="Yali Chen" size="md" status="away" />
          <Avatar name="Yali Chen" size="lg" status="busy" />
          <Avatar name="Yali Chen" size="xl" status="offline" />
        </div>
      </Section>

      <Section title="EmptyState">
        <EmptyState
          icon={Users}
          title={t('showcase.emptyFriendsTitle')}
          description={t('showcase.emptyFriendsDescription')}
          action={{
            label: t('showcase.emptyFriendsAction'),
            onClick: () => toast(t('showcase.actionClicked')),
          }}
        />
      </Section>

      <Section title="Skeleton">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <SkeletonAvatar />
            <SkeletonText lines={2} className="flex-1" />
          </div>
          <SkeletonCard />
          <div className="rounded-md border border-border">
            <SkeletonMessageList count={3} />
          </div>
        </div>
      </Section>

      <Section title="Toast (sonner)">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.success(t('showcase.toastSuccess'))}>
            {t('showcase.triggerSuccess')}
          </Button>
          <Button variant="outline" onClick={() => toast.error(t('showcase.toastError'))}>
            {t('showcase.triggerError')}
          </Button>
          <Button variant="secondary" onClick={() => toast(t('showcase.toastInfo'))}>
            {t('showcase.triggerInfo')}
          </Button>
        </div>
      </Section>

      <Section title="ConfirmDialog">
        <Button variant="destructive" onClick={handleConfirmDemo}>
          {t('showcase.triggerConfirm')}
        </Button>
      </Section>

      <Section title="PageError">
        <Button variant="outline" onClick={() => setShowError((value) => !value)}>
          {showError ? t('showcase.hidePreview') : t('showcase.showPreview')}
        </Button>
        {showError ? (
          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <PageError
              title={t('showcase.pageErrorTitle')}
              message={t('showcase.pageErrorMessage')}
              onRetry={() => toast(t('showcase.retryClicked'))}
            />
          </div>
        ) : null}
      </Section>
    </main>
  );
}
