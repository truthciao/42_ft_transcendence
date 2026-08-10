import { isRouteErrorResponse, useRouteError } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageError } from './PageError';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  if (isRouteErrorResponse(error)) {
    return (
      <PageError
        title={t('errors.routeTitle', { status: error.status })}
        message={error.statusText || t('errors.routeMessage')}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const message = error instanceof Error ? error.message : undefined;

  return (
    <PageError
      title={t('errors.unexpectedTitle')}
      message={message ?? t('errors.unexpectedMessage')}
      onRetry={() => window.location.reload()}
    />
  );
}
