import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface PageErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function PageError({ title, message, onRetry }: PageErrorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">{title ?? t('errors.unexpectedTitle')}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{message ?? t('errors.unexpectedMessage')}</p>
      </div>
      <div className="flex gap-2">
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            {t('errors.retry')}
          </Button>
        ) : null}
        <Button asChild>
          {/* 用原生 <a>，因为这个组件既要在路由层用，也要在 Router 之外的全局 ErrorBoundary 里用 */}
          <a href="/">{t('errors.backHome')}</a>
        </Button>
      </div>
    </div>
  );
}
