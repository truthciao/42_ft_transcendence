import { type FormEvent, useEffect, useState } from 'react';
import { getProfile, updateProfile, type ProfilePayload } from '../api/profile';
import { useTranslation } from "react-i18next";
type ProfileStatus =
| 'idle'
| 'saving'
| 'success'
| 'failed';

interface ProfileData extends ProfilePayload {
  user?: {
    username?: string;
    email?: string;
  };
}

export function ProfilePage() {
  const [form, setForm] = useState<ProfilePayload>({
    displayName: '',
    bio: '',
    avatarUrl: '',
    preferredLanguage: '',
  });
  
  const [userInfo, setUserInfo] = useState<{ username?: string; email?: string } | null>(null);
  const [status, setStatus] = useState<ProfileStatus>('idle');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = (await getProfile()) as ProfileData;
        
        setForm({
          displayName: profile.displayName ?? '',
          bio: profile.bio ?? '',
          avatarUrl: profile.avatarUrl ?? '',
          preferredLanguage: profile.preferredLanguage ?? '',
        });

        if (profile.user) {
          setUserInfo(profile.user);
        }
      } catch (error) {
        setStatus('failed');
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('saving');

    try {
      await updateProfile(form);
      setStatus('success');
    } catch (error) {
      setStatus('failed');
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Profile</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Manage your public profile information.</p>
        </div>
 
        {userInfo && (
          <div style={{ background: '#f3f4f6', padding: '0.5rem 0.75rem', borderRadius: '20px', border: '1px solid #e5e7eb', textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>Logged in as: </span>
            <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{userInfo.username}</strong>
          </div>
        )}
      </div>

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

        <button type="submit" style={{ padding: '0.75rem 1rem', cursor: 'pointer', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Save
        </button>
      </form>

      {status === 'success' && (
        <p style={{ marginTop: '1rem', fontWeight: 'bold', color: 'green' }}>
          {t("profile.status.updateSuccess")}
        </p>
      )}
      {status === 'failed' && (
        <p style={{ marginTop: '1rem', fontWeight: 'bold', color: 'red' }}>
          {t("profile.status.updateError")}
        </p>
      )}
    </main>
  );
}