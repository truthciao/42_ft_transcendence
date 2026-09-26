import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface SecondarySidebarProps {
  titleKey?: string;
  children?: ReactNode;
}

export function SecondarySidebar({
  titleKey,
  children,
}: SecondarySidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-r border-border bg-muted/30">
      {titleKey && (
        <header className="shrink-0 border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold">{t(titleKey)}</h2>
        </header>
      )}

      <div className="min-h-0 flex-1">
        {children}
      </div>
    </aside>
  );
}
