import { Outlet } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Toaster } from '@/components/ui/sooner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ConfirmProvider } from '@/lib/confirm';

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
