import type { ReactNode } from 'react';

export function SecondarySidebar({ children }: { children?: ReactNode }) {
  return (
    <aside className="min-h-0 overflow-y-auto border-r border-border bg-muted/30">
      {children ?? (
        <div className="p-4 text-sm text-muted-foreground">
          Select a section
        </div>
      )}
    </aside>
  );
}
