import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router'; 
import { loginUser, type LoginPayload } from '../api/auth';
import { useAuth } from '../auth/useAuth';
import { useTranslation } from "react-i18next";

export function LoginPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState<LoginPayload>({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus(t("auth.loggingIn"));
    setLoading(true);

    try {
      const payload: LoginPayload = {
        email: form.email.trim(),
        password: form.password,
      };

      const data = await loginUser(payload);
      
      if (data.access_token) {
        localStorage.setItem(
          "access_token",
          data.access_token,
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data.user),
        );

        await refreshUser();

        setStatus(t("auth.success"));

        navigate("/profile");
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus(error instanceof Error ? error.message : t("auth.failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>{t("auth.login")}</h1>
      <p>{t("auth.description")}</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          <div>{t("auth.email")}</div>
          <input
            type="text"
            required
            placeholder="user@example.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
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
          style={{
            padding: '0.75rem 1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {loading ? t("auth.submitting") : t("auth.login")}
        </button>
      </form>

      {status ? (
        <p style={{ marginTop: '1rem', color: status.includes('Failed') || status.includes('must') ? 'red' : 'green' }}>
          {status}
        </p>
      ) : null}

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        {t("auth.noAccount")}? <Link to="/register" style={{ color: '#0070f3' }}>{t("auth.register")}</Link>
      </div>
    </main>
  );
}