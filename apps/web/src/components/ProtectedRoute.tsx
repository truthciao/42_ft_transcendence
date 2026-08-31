import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
