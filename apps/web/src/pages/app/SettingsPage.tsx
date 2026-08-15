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
import { QRCodeCanvas } from 'qrcode.react'; // Import QR code rendering library
import { NavLink } from 'react-router';
import { Input } from '../../components/ui/input';
import { Button }  from '../../components/ui/button';
import { getCurrentUser } from '../../api/users';
import { HttpError } from '@/lib/http';

export function SettingsSidebar() {
  return (
    <div>
      <h3 className="mb-4 font-semibold">Settings</h3>

      <nav className="flex flex-col gap-1">
        <NavLink
          to="/app/settings/profile"
          className="rounded-md px-2 py-1.5"
        >
          Profile
        </NavLink>

        <NavLink
          to="/app/settings/account"
          className="rounded-md px-2 py-1.5"
        >
          Account
        </NavLink>

        <NavLink
          to="/app/settings/notifications"
          className="rounded-md px-2 py-1.5"
        >
          Notifications
        </NavLink>
      </nav>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <p className="text-muted-foreground mt-2">Settings overview</p>
    </div>
  );
}

export function AccountSettingsPage() {

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
    } catch (error: any) {
      console.error('Error generating 2FA:', error);
      alert(error.message || 'Failed to generate 2FA secret');
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
    alert('2FA enabled successfully!');

    } catch (error: any) {
      console.error('Error turning on 2FA:', error);
      alert(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

 const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return;
   
    setLoading(true);
    try {
      await disableTwoFactor();

        setIsTwoFactorEnabled(false);
        alert('2FA disabled');
     } catch (error: any) {
        console.error('Error disabling 2FA:', error);
        alert(`Failed to disable 2FA: ${error.message || 'Unknown error'}`);
     } finally {
      setLoading(false);
     }
  };

  return (
    <div className="flex-1 bg-background p-4 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Account Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your account security and preferences
        </p>
      </div>

      <div className="p-4 border rounded-lg bg-card flex items-center justify-between max-w-xl">
        <div>
          <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
          <p className="text-sm text-muted-foreground">
            Status: {isTwoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}
          </p>
        </div>
        
        {/* Render enable or disable button based on current status */}
        {!isTwoFactorEnabled ? (
          <Button
            onClick={handleStartEnable2FA}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Enable 2FA'}
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={handleDisable2FA}
            disabled={loading} 
          >
            Disable 2FA
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
                Set up Two-Factor Authentication
              </DialogTitle>

              <DialogDescription>
                1. Open your authenticator app (like Google Authenticator).
                <br />
                2. Scan the QR code below or enter the key manually.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center rounded border bg-white p-4">
              {otpauthUrl && (
                <QRCodeCanvas
                  value={otpauthUrl}
                  size={180}
                />
              )}
            </div>

            <div className="text-center text-xs text-muted-foreground break-all">
              Secret Key:{' '}
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
                  Enter 6-digit code from app:
                </label>

                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="123456"
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
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify & Turn On'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>

          </div>
  );
}

export function NotificationSettingsPage() {
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Notification Settings</h2>
      <p className="text-muted-foreground mt-2">
        Notification settings content
      </p>
    </div>
  );
}
