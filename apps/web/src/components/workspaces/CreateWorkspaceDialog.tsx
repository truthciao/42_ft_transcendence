import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorkspaceSchema, type createWorkspacePayload } from '@repo/shared-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateWorkspace } from '@/hooks/useWorkspaceMutations';
import { toast } from 'sonner';

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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<createWorkspacePayload>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: '', description: '', icon: ''},
  });

  const icon = watch('icon');

  function handleOpenChange(next: boolean) {
    if (!next)
      reset();
    onOpenChange(next);
  }

  async function onSubmit(values: createWorkspacePayload) {
    try {
      const workspace = await mutation.mutateAsync(values);
      toast.success(`"${workspace.name}" created`);
      reset();
      onOpenChange(false);
      onCreated?.(workspace.id);
    } catch {
      toast.error('Failed to create workspace');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-1.5'>
            <label className='text-sm font-medium' htmlFor='workspace-name'>Name</label>
            <Input id='workspace-name' placeholder='42 Paris team' {...register('name')} />
            {errors.name ? (
              <p className='text-xs text-destructive'>{errors.name.message}</p>
            ) : null}
          </div>

          <div className='space-y-1.5'>
            <label className='text-sm font-medium' htmlFor='workspace-description'>Description</label>

            <textarea
              id='workspace-description'
              rows={3}
              placeholder="What's this workspace for?"
              className='w-full resize-y rounded-md border border-input bg-background px-2.5 py-1.5 text-sm'
              {...register('description')}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description?.message}</p>
            ): null}
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Icon</span>
            <div className="flex flex-wrap items-center gap-2">
              {ICON_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValue('icon', preset, { shouldValidate: true })}
                  className={`flex size-9 items-center justify-center rounded-full border text-lg transition-colors ${
                    icon === preset ? 'border-ring bg-accent' : 'border-input hover:bg-accent'
                  }`}
                >
                  {preset}
                </button>
              ))}
              <Input className="w-16 text-center" maxLength={4} placeholder="🙂" {...register('icon')} />
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
