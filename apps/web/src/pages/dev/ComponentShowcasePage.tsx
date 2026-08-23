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
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function ColorSwatch({
  name,
  className,
}: {
  name: string;
  className: string;
}) {
  return (
    <div className="space-y-2">
      <div className={`h-16 rounded-md border border-border ${className}`} />
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}

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

      <Section title="Colors">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ColorSwatch name="Primary" className="bg-primary" />
          <ColorSwatch name="Secondary" className="bg-secondary" />
          <ColorSwatch name="Accent" className="bg-accent" />
          <ColorSwatch name="Muted" className="bg-muted" />
          <ColorSwatch name="Success" className="bg-success" />
          <ColorSwatch name="Warning" className="bg-warning" />
          <ColorSwatch name="Destructive" className="bg-destructive" />
          <ColorSwatch name="Background" className="bg-background" />
          <ColorSwatch name="Card" className="bg-card" />
          <ColorSwatch name="Border" className="bg-border" />
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Heading 1</h1>
          <h2 className="text-3xl font-semibold">Heading 2</h2>
          <h3 className="text-2xl font-semibold">Heading 3</h3>
          <p className="text-base">
            Body text — The quick brown fox jumps over the lazy dog.
          </p>
          <p className="text-sm text-muted-foreground">
            Small / secondary text
          </p>
          <p className="text-xs text-muted-foreground">
            Caption text
          </p>
        </div>
      </Section>

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

      <Section title="Input">
        <div className="max-w-sm space-y-3">
          <Input placeholder="Enter your username..." />
          <Input defaultValue="Victoria" />
          <Input disabled placeholder="Disabled input" />
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

      <Section title="Dialog">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            Open Dialog
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Example Dialog</DialogTitle>
              <DialogDescription>
                This is an example of our reusable dialog component.
              </DialogDescription>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              Dialog content can be placed here.
            </p>

            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Dropdown Menu">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Open Menu
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>

              <DropdownMenuItem onClick={() => toast('Profile clicked')}>
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => toast('Settings clicked')}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => toast('Sign out clicked')}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section title="Tooltip">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" />}>
              Hover me
            </TooltipTrigger>

            <TooltipContent>
              <p>This is a reusable tooltip.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
