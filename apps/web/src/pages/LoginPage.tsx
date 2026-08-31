import { 
  loginUser,
  loginWithTwoFactor,
  type LoginPayload,
} from '../api/auth';
import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button';
import { HttpError } from '@/lib/http';
import { disconnectSocket } from '@/lib/realtime';
import { cn } from '@/lib/utils';

type LoginStatus = 'idle' | 'loggingIn' | 'failed';

export function LoginPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [form, setForm] = useState<LoginPayload>({
    email: '',
    password: '',
  });
  
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  // State for two-factor authentication interruption flow
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [totpCode, setTotpCode] = useState('');

  // Handle token passed from URL (e.g. redirected back from third-party login)
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const requires2FAFromUrl = searchParams.get('requires2FA');
    const userIdFromUrl = searchParams.get('userId');

    if (tokenFromUrl) {
      localStorage.setItem('access_token', tokenFromUrl);
      refreshUser().then(() => {
        navigate('/app/chat', { replace: true });
      });
      return;
    }

    if (requires2FAFromUrl === 'true' && userIdFromUrl) {
      setRequires2FA(true);
      setUserId(Number(userIdFromUrl));
    }
  }, [searchParams, navigate, refreshUser]);

  // Stage 1: Submit email and password for login
  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setStatus('loggingIn');
    setIsSubmitting(true);

    try {
      const payload: LoginPayload = {
        email: form.email.trim(),
        password: form.password,
      };

      const data = await loginUser(payload);

      // Core interception check: if the backend requires 2FA verification
    if ('requiresTwoFactor' in data && data.requiresTwoFactor) {
      setRequires2FA(true);
      setUserId(data.userId);
      setStatus('idle');
      return;
    }
      

      // If 2FA is not enabled, log in successfully directly
      if ('access_token' in data) {
        disconnectSocket();
        localStorage.setItem("access_token", data.access_token);
        
        await refreshUser();
       
        navigate('/app/chat', { replace: true });
      }
    } catch (error) { 
      if (error instanceof HttpError)
      {
        console.error(error.status, error.message);
      } else {
        console.error(error);
      }
      setStatus('failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify2FA(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('loggingIn');

  try {
    const data = await loginWithTwoFactor(
      userId!, 
      totpCode.trim(),
    );

    if ('access_token' in data) {
      disconnectSocket();
      localStorage.setItem('access_token', data.access_token);
      
      await refreshUser();

      navigate('/app/chat', { replace: true});
    }
  } catch (error) {
    console.error('2FA verification failed:', error);
    setStatus('failed');
  }

  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <main className="mx-auto max-w-[400px] font-sans">
      <h1>{t("auth.login")}</h1>
      <p>{requires2FA ? t('auth.twoFactorDescription') : t("auth.description")}</p>

      {!requires2FA ? (
        /* Stage 1: Standard email and password form */
        <form onSubmit={handleLogin} className="grid gap-4">
          <label>
            <div>{t("auth.email")}</div>
            <Input
              type="text"
              required
              placeholder="user@example.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full" 
            />
          </label>

          <label>
            <div>{t("auth.password")}</div>
            <Input
              type="password"
              required
              value={form.password ?? ''}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full" 
            />
          </label>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth.submitting") : t("auth.login")}
          </Button>
        </form>
      ) : (
        /* Stage 2: 2FA dynamic code interception form */
        <form onSubmit={handleVerify2FA} className="grid gap-4">
          <label>
            <div>{t('auth.twoFactorCodeLabel')}</div>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder={t('auth.codePlaceholder')}
              value={totpCode}
              onChange={(event) => setTotpCode(event.target.value)}
              className="w-full text-center text-lg tracking-widest" 
            />
          </label>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Verify & Enter System'}
          </Button>
        </form>
      )}

      {/* Show third-party login and registration link only when 2FA is not required */}
      {!requires2FA && (
        <>
          <div className="my-6 text-center leading-[0.1em] border-b border-border">
            <span className="bg-background px-2.5 text-sm text-muted-foreground">
              OR
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full gap-2" 
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.14v3.15C3.16 21.37 7.23 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.5-.38-2.25s.13-1.53.38-2.25V6.6H1.14C.41 8.1 0 9.8 0 12s.41 3.9 1.14 5.4l4.14-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.16 2.63 1.14 6.6l4.14 3.15c.95-2.84 3.6-4.95 6.72-4.95z" />
            </svg>
            Sign in with Google
          </Button>
        </>
      )}

      {status !== 'idle' ? (
        <p
          className={cn(
            'mt-4 text-center',
            status === 'failed' && 'text-destructive',
          )}
        >
          {status === 'failed' ? t('auth.loginFailed') : t(`auth.status.${status}`)}
        </p>
      ) : null}

      {!requires2FA && (
        <div className="mt-6 text-center text-sm">
          {t("auth.noAccount")}? 
          <Link
            to="/register"
            className="text-primary hover:underline"
          >
            {t('auth.register')}
          </Link>
        </div>
      )}
    </main>
  );
}
