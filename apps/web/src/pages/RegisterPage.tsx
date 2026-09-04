import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { registerUser, type RegisterPayload } from '../api/auth';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { HttpError } from '@/lib/http';
import {
  registerSchema,
  emailSchema,
  usernameSchema,
  passwordSchema,
} from '@repo/shared-types';

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
  const [validationError, setValidationError] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const { t } = useTranslation();

  const email = form.email;
  const username = form.username;
  const password = form.password ?? '';

  const emailValid = emailSchema.safeParse(email).success;

  const usernameResult = usernameSchema.safeParse(username);
  const usernameValid = {
    minLength:
      usernameResult.success ||
      !usernameResult.error.issues.some(
        (issue) => issue.code === 'too_small',
      ),
    maxLength:
      usernameResult.success ||
      !usernameResult.error.issues.some(
        (issue) => issue.code === 'too_big',
      ),
    characters:
      usernameResult.success ||
      !usernameResult.error.issues.some(
        (issue) => issue.code === 'invalid_format',
      ),
  };

  const passwordResult = passwordSchema.safeParse(password);
  const passwordValid = {
    minLength:
      passwordResult.success ||
      !passwordResult.error.issues.some(
        (issue) => issue.code === 'too_small',
      ),
    maxLength:
      passwordResult.success ||
      !passwordResult.error.issues.some(
        (issue) => issue.code === 'too_big',
      ),
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const validation = registerSchema.safeParse(form);

    if (!validation.success) {
      setValidationError(true);
      return;
    }

    setValidationError(false);
    setStatus('creating');
    setLoading(true);

    try {
      await registerUser(form);

      setRegisterError(null);
      setStatus('success');

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      setStatus('failed');

      if (
        error instanceof HttpError &&
        error.message === 'Email or username already exists'
        ) {
          setRegisterError(t('auth.emailOrUsernameExists'));
        } else {
          setRegisterError(t('auth.registerStatus.failed'));
        }
      } finally {
        setLoading(false);
      }
    }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1>{t('auth.register')}</h1>
      <p>{t('auth.registerDescription')}</p>

      <form 
        noValidate
        onSubmit={handleSubmit}
        className="grid gap-4"
      >
        <label>
          <div>{t('auth.email')}</div>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(event) => {
              setValidationError(false);
              setRegisterError(null);
              setStatus('idle');
              setForm({ ...form, email: event.target.value });
            }}
            className="w-full"
          />

          {email.length > 0 ? (
            <div className="mt-2 text-sm">
              {emailValid ? '✅' : '❌'}{' '}
              {t('auth.emailValid')}
            </div>
            ) : null}
        </label>

        <label>
          <div>{t('auth.username')}</div>
          <Input
            type="text"
            required
            value={form.username}
            onChange={(event) => {
              setValidationError(false);
              setRegisterError(null);
              setStatus('idle');
              setForm({ ...form, username: event.target.value });
            }}
            className="w-full"
          />
            {username.length > 0 ? (
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  {usernameValid.minLength ? '✅' : '❌'}{' '}
                  {t('auth.usernameMinLength')}
                </div>

                <div>
                  {usernameValid.maxLength ? '✅' : '❌'}{' '}
                  {t('auth.usernameMaxLength')}
                </div>

                <div>
                  {usernameValid.characters ? '✅' : '❌'}{' '}
                  {t('auth.usernameCharacters')}
                </div>
              </div>
            ) : null}
        </label>

        <label>
          <div>{t('auth.password')}</div>
          <Input
            type="password"
            required
            value={form.password ?? ''}
            onChange={(event) => {
              setValidationError(false);
              setRegisterError(null);
              setStatus('idle');
              setForm({ ...form, password: event.target.value });
            }}
            className="w-full"
          />

            {password.length > 0 ? (
              <div className="mt-2 space-y-1 text-sm">
                <div>
                 {passwordValid.minLength ? '✅' : '❌'}{' '}
                 {t('auth.passwordMinLength')}
                </div>

                <div>
                 {passwordValid.maxLength ? '✅' : '❌'}{' '}
                 {t('auth.passwordMaxLength')}
                </div>
              </div>
            ) : null}
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? t('auth.submitting') : t('auth.register')}
        </Button>
      </form>

      {validationError ? (
        <p className="mt-4 text-sm text-destructive">
          {t('auth.validationError')}
        </p>
      ) : null}

      {registerError ? (
        <p className="mt-4 text-sm text-destructive">
          {registerError}
        </p>
      ) : null}  

      {status !== 'idle' && status !== 'failed' ? (
        <p className="mt-4 text-sm">
          {t(`auth.registerStatus.${status}`)}
        </p>
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
