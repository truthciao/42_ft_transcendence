import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export function SecondarySidebar({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();

  return (
    <aside className="min-h-0 overflow-y-auto border-r border-border bg-muted/30">
      {children ?? (
        <div className="p-4 text-sm text-muted-foreground">
          {t('common.selectSection')}
        </div>
      )}
    </aside>
  );
}
