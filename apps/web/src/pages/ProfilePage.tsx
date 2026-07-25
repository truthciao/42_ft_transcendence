import { FormEvent, useEffect, useState } from 'react';
import { getProfile, updateProfile, type ProfilePayload } from '../api/profile';

export function ProfilePage() {
  const [form, setForm] = useState<ProfilePayload>({
    username: '',
    displayName: '',
    bio: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        setForm({
          username: profile.username ?? '',
          displayName: profile.displayName ?? '',
          bio: profile.bio ?? '',
        });
      } catch {
        setStatus('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('Saving...');

    try {
      await updateProfile(form);
      setStatus('Profile updated');
    } catch {
      setStatus('Failed to update profile');
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Profile</h1>
      <p>Manage your public profile information.</p>

      {loading ? <p>Loading...</p> : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          <div>Username</div>
          <input
            value={form.username ?? ''}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>

        <label>
          <div>Display name</div>
          <input
            value={form.displayName ?? ''}
            onChange={(event) => setForm({ ...form, displayName: event.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>

        <label>
          <div>Bio</div>
          <textarea
            value={form.bio ?? ''}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
            rows={5}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>

        <button type="submit" style={{ padding: '0.75rem 1rem', cursor: 'pointer' }}>
          Save
        </button>
      </form>

      {status ? <p>{status}</p> : null}
    </main>
  );
}
