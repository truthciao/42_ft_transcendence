import type { ReactNode } from 'react';
import { useState } from 'react';
import { Outlet, useMatches } from 'react-router';
import { TopBar } from '@/components/layout/TopBar';
import { TabRail } from '@/components/layout/TabRail';
import { SecondarySidebar } from '@/components/layout/SecondarySidebar';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Toaster } from 'sonner';
import { ConfirmProvider } from '@/lib/confirm';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

interface AppRouteHandle {
  secondarySidebar?: {
    titleKey: string;
    render: () => ReactNode;
  };
}

export function AppLayout() {
  const matches = useMatches();

  const secondarySidebar = [...matches]
    .reverse()
    .map(
      (match) =>
        (match.handle as AppRouteHandle | undefined)?.secondarySidebar,
    )
    .find(Boolean);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ConfirmProvider>
      <TooltipProvider>
        <div className="grid h-dvh min-h-0 grid-cols-1 grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-background md:grid-cols-[72px_260px_1fr]">
          <header className="col-span-1 min-w-0 border-b border-border md:col-span-3">
            <TopBar onMenuClick={() => setMobileNavOpen(true)} />

            <MobileNavigation
              open={mobileNavOpen}
              onOpenChange={setMobileNavOpen}
            />
          </header>

          <div className="hidden min-h-0 md:block">
            <TabRail />
          </div>

          <div className="hidden min-h-0 md:block">
            <SecondarySidebar titleKey={secondarySidebar?.titleKey}>
              {secondarySidebar?.render()}
            </SecondarySidebar>
          </div>

          <main className="min-h-0 min-w-0 overflow-y-auto">
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
