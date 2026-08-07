import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { loginUser, type LoginPayload } from '../api/auth';
import { useAuth } from '../auth/useAuth';
import { useTranslation } from 'react-i18next';

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
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('access_token', tokenFromUrl);
      refreshUser().then(() => {
        navigate('/app/chat', { replace: true });
      });
    }
  }, [searchParams, navigate, refreshUser]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('loggingIn');
    setLoading(true);

    try {
      const payload: LoginPayload = {
        email: form.email.trim(),
        password: form.password,
      };

      const data = await loginUser(payload);

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);

        await refreshUser();

        navigate('/app/chat');
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <main
      style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}
    >
      <h1>{t('auth.login')}</h1>
      <p>{t('auth.description')}</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          <div>{t('auth.email')}</div>
          <input
            type="text"
            required
            placeholder="user@example.com"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            style={{
              width: '100%',
              padding: '0.5rem',
              boxSizing: 'border-box',
            }}
          />
        </label>

        <label>
          <div>{t('auth.password')}</div>
          <input
            type="password"
            required
            value={form.password ?? ''}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            style={{
              width: '100%',
              padding: '0.5rem',
              boxSizing: 'border-box',
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {loading ? t('auth.submitting') : t('auth.login')}
        </button>
      </form>

      <div
        style={{
          margin: '1.5rem 0',
          textAlign: 'center',
          borderBottom: '1px solid #ddd',
          lineHeight: '0.1em',
        }}
      >
        <span
          style={{
            background: '#fff',
            padding: '0 10px',
            color: '#777',
            fontSize: '0.85rem',
          }}
        >
          OR
        </span>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          cursor: 'pointer',
          backgroundColor: '#fff',
          color: '#3c4043',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'background-color 0.2s',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.14v3.15C3.16 21.37 7.23 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.25c-.25-.72-.38-1.5-.38-2.25s.13-1.53.38-2.25V6.6H1.14C.41 8.1 0 9.8 0 12s.41 3.9 1.14 5.4l4.14-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.16 2.63 1.14 6.6l4.14 3.15c.95-2.84 3.6-4.95 6.72-4.95z"
          />
        </svg>
        Sign in with Google
      </button>

      {status !== 'idle' ? (
        <p
          style={{
            marginTop: '1rem',
            color: status === 'failed' ? 'red' : 'inherit',
          }}
        >
          {t(`auth.status.${status}`)}
        </p>
      ) : null}

      <div
        style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}
      >
        {t('auth.noAccount')}?{' '}
        <Link to="/register" style={{ color: '#0070f3' }}>
          {t('auth.register')}
        </Link>
      </div>
    </main>
  );
}
