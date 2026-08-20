import type { ReactNode } from 'react';
import { Outlet, useMatches } from 'react-router';
import { TopBar } from '@/components/layout/TopBar';
import { TabRail } from '@/components/layout/TabRail';
import { SecondarySidebar } from '@/components/layout/SecondarySidebar';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Toaster } from 'sonner';
import { ConfirmProvider } from '@/lib/confirm';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppRouteHandle {
  secondarySidebar?: () => ReactNode;
}

export function AppLayout() {
  const matches = useMatches();

  const secondarySidebarContent = [...matches]
    .reverse()
    .map((match) =>
      (match.handle as AppRouteHandle | undefined)?.secondarySidebar?.(),
    )
    .find(Boolean);

  return (
    <ConfirmProvider>
      <TooltipProvider>
        <div className="grid h-dvh min-h-0 grid-cols-[72px_260px_1fr] grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-background">
          <header className="col-span-3 min-w-0 border-b border-border">
            <TopBar />
          </header>

          <TabRail />

          <SecondarySidebar>{secondarySidebarContent}</SecondarySidebar>

          <main className="min-h-0 min-w-0 overflow-hidden">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </ConfirmProvider>
  );
}
