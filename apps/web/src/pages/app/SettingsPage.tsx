import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

import {
  generateTwoFactor,
  turnOnTwoFactor,
  disableTwoFactor,
} from '../../api/auth';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { QRCodeCanvas } from 'qrcode.react'; // Import QR code rendering library
import { NavLink } from 'react-router';
import { Input } from '../../components/ui/input';
import { Button }  from '../../components/ui/button';
import { getCurrentUser } from '../../api/users';
import { HttpError } from '@/lib/http';

export function SettingsSidebar() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="mb-4 font-semibold">
        {t('settings.title')}
      </h3>

      <nav className="flex flex-col gap-1">
        <NavLink
          to="/app/settings/profile"
          className="rounded-md px-2 py-1.5"
        >
          {t('settings.profile')}
        </NavLink>

        <NavLink
          to="/app/settings/account"
          className="rounded-md px-2 py-1.5"
        >
          {t('settings.account')}
        </NavLink>

        <NavLink
          to="/app/settings/notifications"
          className="rounded-md px-2 py-1.5"
        >
          {t('settings.notifications')}
        </NavLink>
      </nav>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 bg-background p-6">
      <h2 className="text-2xl font-semibold">
        {t('settings.title')}
      </h2>

      <p className="mt-2 text-muted-foreground">
        {t('settings.description')}
      </p>
    </div>
  );
}

export function AccountSettingsPage() {
  const { t }  = useTranslation();

  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  
  // States to control setup modal, secret key, otpauth url, and verification code input
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {  
        const userData = await getCurrentUser();

        if (userData) {
          const status = userData.isTwoFactorEnabled;
          setIsTwoFactorEnabled(Boolean(status));
        }
      } catch (error) {
        if (error instanceof HttpError) {
          console.error(error.status, error.message);
        } else {
          console.error(error);
        }
      }
    };
    fetchUserProfile();
  }, []);

  // Step 1: Request backend to generate 2FA secret and QR code URL
  const handleStartEnable2FA = async () => {
    setLoading(true);
    try {
      const data = await generateTwoFactor();

    if (data && data.otpauthUrl) {
      setOtpauthUrl(data.otpauthUrl);
      setSecret(data.secret);
      setShowSetupModal(true);
    }
    } catch (error) {
      if (error instanceof HttpError) {
        console.error(error.status, error.message);
        alert(error.message || t('settings.twoFactor.generateError'));
      } else {
        console.error(error);
        alert(t('settings.twoFactor.generateError'));
      }  
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit 6-digit code to formally turn on backend 2FA status
  const handleVerifyAndTurnOn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await turnOnTwoFactor(verifyCode.trim());

    setIsTwoFactorEnabled(true);
    setShowSetupModal(false); 
    setVerifyCode('');
    alert(t('settings.twoFactor.enableSuccess'));

    } catch (error) {
      if (error instanceof HttpError) {
        console.error(error.status, error.message);
        alert(error.message || t('settings.twoFactor.invalidCode'));
      } else {
        console.error(error);
        alert(t('settings.twoFactor.invalidCode'));
      }
    } finally {
      setLoading(false);
    }
  };

 const handleDisable2FA = async () => {
    if (!confirm(t('settings.twoFactor.disableConfirm'))) return;
   
    setLoading(true);
    try {
      await disableTwoFactor();

        setIsTwoFactorEnabled(false);
        alert(t('settings.twoFactor.disableSuccess'));
     } catch (error) {
        if (error instanceof HttpError) {
        console.error(error.status, error.message);
        alert(
          `${t('settings.twoFactor.disableError')}: ${
            error.message || t('settings.twoFactor.unknownError')
          }`,
        );
        } else {
          console.error(error);
          alert(
            `${t('settings.twoFactor.disableError')}: ${
              t('settings.twoFactor.unknownError')
            }`,
          );
        }
      } finally {
      setLoading(false);
     }
  };

  return (
    <div className="flex-1 bg-background p-4 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">
          {t('settings.accountTitle')} 
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('settings.accountDescription')}
        </p>
      </div>

      <div className="p-4 border rounded-lg bg-card flex items-center justify-between max-w-xl">
        <div>
          <h4 className="font-medium"> 
            {t('settings.twoFactor.title')}
          </h4>
            <p className="text-sm text-muted-foreground">
              {t('settings.twoFactor.status')}:{' '}
              {isTwoFactorEnabled
                ? `✅ ${t('settings.twoFactor.statusEnabled')}`
                : `❌ ${t('settings.twoFactor.statusDisabled')}`}
            </p>
        </div>
        
        {/* Render enable or disable button based on current status */}
        {!isTwoFactorEnabled ? (
          <Button
            onClick={handleStartEnable2FA}
            disabled={loading}
          >
            {loading 
              ? t('common.loading')
              : t('settings.twoFactor.enable')}    
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={handleDisable2FA}
            disabled={loading} 
          >
          {loading
            ? t('common.loading')
            : t('settings.twoFactor.disable')}
          </Button>
        )}
      </div>

      {/* QR code scanning and activation modal panel */}
        <Dialog
          open={showSetupModal}
          onOpenChange={setShowSetupModal}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t('settings.twoFactor.setupTitle')} 
              </DialogTitle>

              <DialogDescription className="whitespace-pre-line">
                 {t('settings.twoFactor.setupDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center rounded border bg-background p-4">
              {otpauthUrl && (
                <QRCodeCanvas
                  value={otpauthUrl}
                  size={180}
                />
              )}
            </div>

            <div className="text-center text-xs text-muted-foreground break-all">
              {t('settings.twoFactor.secretKey')}:{' '}
              <span className="font-mono font-semibold">
                {secret}
              </span>
            </div>

            <form
              onSubmit={handleVerifyAndTurnOn}
              className="space-y-3"
            >
              <div>
                <label 
                  htmlFor="two-factor-code"
                  className="text-sm font-medium">
                  {t('settings.twoFactor.codeLabel')}
                </label>

                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder={t('settings.twoFactor.codePlaceholder')}
                  className="mt-1 w-full text-center tracking-widest text-lg font-mono"
                />
              </div>

              <DialogFooter className="mx-0 mb-0 rounded-none border-0 bg-transparent p-0 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSetupModal(false)}
                >
                  {t('common.cancel')}
                </Button>

                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                {loading
                  ? t('settings.twoFactor.verifying')
                  : t('settings.twoFactor.verifyAndTurnOn')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>

          </div>
  );
}

export function NotificationSettingsPage() {
  const { t } = useTranslation();
  const { data: prefs = [], isLoading, isError, error } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const handleToggle = (type: string, field: 'viaInApp' | 'viaEmail' | 'viaPush') => {
    const item = prefs.find((p: any) => p.type === type) || { type, viaInApp: true, viaEmail: false, viaPush: false };
    const updated = { ...item, [field]: !item[field] };
    updatePrefs.mutate([updated]);
  };

  if (isLoading) {
    return <p className="text-muted-foreground">{t('common.loading')}</p>;
  }

  if (isError) {
    return <p className="text-red-500">Error loading preferences: {(error as any)?.message}</p>;
  }

  if (!prefs || prefs.length === 0) {
    return <p className="text-muted-foreground">No notification preferences available</p>;
  }

  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">
        {t('settings.notificationsTitle')} 
      </h2>
      <p className="text-muted-foreground mt-2">
        {t('settings.notificationsDescription')} 
      </p>

      <div className="mt-6 space-y-4 max-w-xl">
        {prefs.map((p: any) => (
          <div key={p.type} className="flex items-center justify-between p-4 border rounded bg-card">
            <div>
              <div className="font-medium">{t(`notifications.types.${p.type}`, { defaultValue: p.type })}</div>
              <div className="text-sm text-muted-foreground">{t(`notifications.descriptions.${p.type}`, { defaultValue: '' })}</div>
            </div>

            <div className="flex gap-3 items-center">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.viaInApp} onChange={() => handleToggle(p.type, 'viaInApp')} />
                <span className="text-sm">{t('notifications.channels.inApp')}</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.viaEmail} onChange={() => handleToggle(p.type, 'viaEmail')} />
                <span className="text-sm">{t('notifications.channels.email')}</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.viaPush} onChange={() => handleToggle(p.type, 'viaPush')} />
                <span className="text-sm">{t('notifications.channels.push')}</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
