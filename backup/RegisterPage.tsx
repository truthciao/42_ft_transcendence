import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { register } from '../api/auth';

export function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('Processing...');

    try {
      await register({
        email: form.email,
        password: form.password,
        username: form.username,
      });
      setStatus('Registration successful! Redirecting to login...');
      
      setTimeout(() => navigate('/login'), 1000); 
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Register</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          <div>Email</div>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>

        <label>
          <div>Username</div>
          <input
            type="text"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>

        <label>
          <div>Password</div>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>

        <button type="submit" style={{ padding: '0.75rem 1rem', cursor: 'pointer' }}>
          Register
        </button>
      </form>

      <Link
        to="/login"
        style={{
          display: 'inline-block',
          marginTop: '1rem',
          color: '#0066cc',
          textDecoration: 'none',
        }}
      >
        Already have an account? Login
      </Link>

      {status ? <p>{status}</p> : null}
    </main>
  );
}