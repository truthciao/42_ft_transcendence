import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router'; 
import { registerUser, type RegisterPayload } from '../api/auth';
import { useTranslation } from "react-i18next";
type RegisterStatus = | 'idle' | 'creating' | 'success' | 'failed';

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
    <main style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>{t("auth.register")}</h1>
      <p>{t("auth.registerDescription")}</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          <div>{t("auth.email")}</div>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </label>

        <label>
          <div>{t("auth.username")}</div>
          <input
            type="text"
            required
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </label>

        <label>
          <div>{t("auth.password")}</div>
          <input
            type="password"
            required
            value={form.password ?? ''}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem 1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Submitting...' : 'Register'}
        </button>
      </form>

      {status !== 'idle' ? <p style={{ marginTop: '1rem' }}>{t(`auth.status.${status}`)}</p> : null}

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" style={{ color: '#0070f3' }}>Login here</Link>
      </div>
    </main>
  );
}