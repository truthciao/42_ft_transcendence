import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { registerUser, type RegisterPayload } from '../api/auth';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type RegisterStatus = 'idle' | 'creating' | 'success' | 'failed';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterPayload>({
    email: '',
    username: '',
    password: '',
  });
  const [status, setStatus] = useState<RegisterStatus>('idle');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('creating');
    setLoading(true);

    try {
      await registerUser(form);

      setStatus('success');

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch {
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1>{t('auth.register')}</h1>
      <p>{t('auth.registerDescription')}</p>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <label>
          <div>{t('auth.email')}</div>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            className="w-full"
          />
        </label>

        <label>
          <div>{t('auth.username')}</div>
          <Input
            type="text"
            required
            value={form.username}
            onChange={(event) =>
              setForm({ ...form, username: event.target.value })
            }
            className="w-full"
          />
        </label>

        <label>
          <div>{t('auth.password')}</div>
          <Input
            type="password"
            required
            value={form.password ?? ''}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            className="w-full"
          />
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? t('auth.submitting') : t('auth.register')}
        </Button>
      </form>

      {status !== 'idle' ? (
        <p className="mt-4 text-sm">{t(`auth.status.${status}`)}</p>
      ) : null}

      <div className="mt-6 text-center text-sm">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-primary hover:underline">
          {t('auth.loginHere')}
        </Link>
      </div>
    </main>
  );
}
