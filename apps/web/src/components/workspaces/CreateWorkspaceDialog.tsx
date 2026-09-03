import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createWorkspaceSchema,
  type createWorkspacePayload,
} from '@repo/shared-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateWorkspace } from '@/hooks/useWorkspaceMutations';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ICON_PRESETS = ['🚀', '💼', '🎮', '🎨', '📚', '🛠️', '🌱', '⚡'];

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (workspaceId: number) => void;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const mutation = useCreateWorkspace();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<createWorkspacePayload>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: '', description: '', icon: '' },
  });

  const icon = watch('icon');

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function onSubmit(values: createWorkspacePayload) {
    try {
      const workspace = await mutation.mutateAsync(values);
      toast.success(t('workspaces.create.success', { name: workspace.name }));
      reset();
      onOpenChange(false);
      onCreated?.(workspace.id);
    } catch {
      toast.error(t('workspaces.create.error'));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('workspaces.create.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="workspace-name">
              {t('workspaces.create.name')}
            </label>
            <Input
              id="workspace-name"
              placeholder={t('workspaces.create.namePlaceholder')}
              {...register('name')}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              htmlFor="workspace-description"
            >
              {t('workspaces.create.description')}
            </label>

            <textarea
              id="workspace-description"
              rows={3}
              placeholder={t('workspaces.create.descriptionPlaceholder')}
              className="w-full resize-y rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
              {...register('description')}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">
                {errors.description?.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">
              {t('workspaces.create.icon')}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {ICON_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setValue('icon', preset, { shouldValidate: true })
                  }
                  className={`rounded-full text-lg ${
                    icon === preset
                      ? 'border-ring bg-accent'
                      : 'hover:bg-accent'
                  }`}
                >
                  {preset}
                </Button>
              ))}
              <Input
                className="w-16 text-center"
                maxLength={4}
                placeholder="🙂"
                {...register('icon')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('workspaces.create.submitting')
                : t('workspaces.create.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
