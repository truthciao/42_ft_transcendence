import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router'; 
import { registerUser, type RegisterPayload } from '../api/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterPayload>({
    email: '',
    username: '',
    password: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('Creating account...');
    setLoading(true);

    try {
  
      await registerUser(form);

      setStatus('Registration successful! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Register</h1>
      <p>Create a new account to get started.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          <div>Email</div>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </label>

        <label>
          <div>Username</div>
          <input
            type="text"
            required
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </label>

        <label>
          <div>Password</div>
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

      {status ? <p style={{ marginTop: '1rem' }}>{status}</p> : null}

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" style={{ color: '#0070f3' }}>Login here</Link>
      </div>
    </main>
  );
}