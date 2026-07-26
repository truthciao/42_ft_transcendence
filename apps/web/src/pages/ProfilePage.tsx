import { type FormEvent, useEffect, useState } from 'react';
import { getProfile, updateProfile, type ProfilePayload } from '../api/profile';

export function ProfilePage() {
  const [form, setForm] = useState<ProfilePayload>({
    displayName: '',
    bio: '',
    avatarUrl: '',
    preferredLanguage: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        setForm({
          displayName: profile.displayName ?? '',
          bio: profile.bio ?? '',
          avatarUrl: profile.avatarUrl ?? '',
          preferredLanguage: profile.preferredLanguage ?? '',
        });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to load profile');
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
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Profile</h1>
      <p>Manage your public profile information.</p>

      {loading ? <p>Loading...</p> : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
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

        <label>
          <div>Avatar URL</div>
          <input
            type="url"
            value={form.avatarUrl ?? ''}
            onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>

        <label>
          <div>Preferred language</div>
          <input
            value={form.preferredLanguage ?? ''}
            onChange={(event) => setForm({ ...form, preferredLanguage: event.target.value })}
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
