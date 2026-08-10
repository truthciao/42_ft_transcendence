import { Outlet } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Toaster } from '@/components/ui/sooner';
import { ConfirmProvider } from '@/lib/confirm';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export function RootLayout() {
  return (
    <ConfirmProvider>
      <div className='flex min-h-screen flex-col'>
        <Navbar />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
      <Toaster />
    </ConfirmProvider>
  );
}
