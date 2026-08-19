import { MessageCircle, Plus, Settings, Users, Waypoints } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import { usePrefetchWorkspace, useWorkspaces } from '@/hooks/useWorkspaces';
import { useState } from 'react';
import { CreateWorkspaceDialog } from '../workspaces/CreateWorkspaceDialog';

const tabs = [
  { to: '/app/chat', label: 'Messages', icon: MessageCircle },
  { to: '/app/friends', label: 'Friends', icon: Users },
  { to: '/app/spaces', label: 'Spaces', icon: Waypoints },
  { to: '/app/settings/profile', label: 'Settings', icon: Settings },
];

const PALETTE = [
  'bg-indigo-500', 'bg-orange-500', 'bg-emerald-500', 'bg-rose-500',
  'bg-sky-500', 'bg-amber-500', 'bg-violet-500', 'bg-teal-500',
];

function paletteFor(id: number): string {
  return PALETTE[id % PALETTE.length];
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function TabRail() {
  const { data: workspaces } = useWorkspaces();
  const prefetchWorkspace = usePrefetchWorkspace();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <nav className="flex min-h-0 flex-col items-center gap-3 overflow-y-auto border-r border-border bg-sidebar px-2 py-3">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          className={({ isActive }) =>
            cn(
              'flex size-11 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isActive && 'bg-sidebar-primary text-sidebar-primary-foreground',
            )
          }
        >
          <Icon className="size-5" />
          <span className="sr-only">{label}</span>
        </NavLink>
      ))}

      <div className="my-1 h-px w-8 bg-border" />

      {workspaces?.map((space) => (
        <NavLink
          key={space.id}
          to={`/app/spaces/${space.id}`}
          title={space.name}
          onMouseEnter={() => prefetchWorkspace(space.id)}
          onFocus={() => prefetchWorkspace(space.id)}
          className={({ isActive }) =>
            cn(
              'flex size-11 items-center justify-center rounded-full text-white ring-offset-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive && 'ring-2 ring-ring ring-offset-2',
            )
          }
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-full text-base font-semibold',
                paletteFor(space.id),
              )}
            >
            {space.icon || initials(space.name)}
          </span>
        </NavLink>
      ))}

      <button
        type='button'
        title="Create workspace"
        onClick={() => setCreateOpen(true)}
        className="flex size-11 items-center justify-center rounded-full border border-dashed border-sidebar-border text-sidebar-foreground/60 transition-colors hover:border-solid hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Plus className='size-5' />
        <span className='sr-only'>Create workspace</span>
      </button>

      <CreateWorkspaceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => navigate(`/app/spaces/${id}`)}
        />
    </nav>
  );
}
