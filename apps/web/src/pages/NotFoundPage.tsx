import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { FileQuestion } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className='flex min-h-[70vh] items-center justify-center px-6'>
      <EmptyState
        icon = { FileQuestion }
        title={t('notfound.title')}
        description={t('notfound.message')}
        action={{ label: t('notfound.back'), onClick: () => navigate('/')}}
      />
    </main>
  );
}
