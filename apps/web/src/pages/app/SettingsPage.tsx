import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // Import QR code rendering library
import { NavLink } from 'react-router';
import { httpGet, httpPost } from '../../lib/http';

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
        const userData = await httpGet<any>('/users/me');

        if (userData) {
          const status = userData.isTwoFactorEnabled ?? userData.twoFactorEnabled ?? false;
          setIsTwoFactorEnabled(Boolean(status));
        }
      } catch (error: any) {
          console.error('Failed to fetch user profile: ', error.message);
      }
    };
    fetchUserProfile();
  }, []);

interface TwoFactorGenerateResponse {
  otpauthUrl: string;
  secret: string;
}

  // Step 1: Request backend to generate 2FA secret and QR code URL
  const handleStartEnable2FA = async () => {
    setLoading(true);
    try {
      const data = await httpPost<TwoFactorGenerateResponse>('/auth/2fa/generate');

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
      await httpPost('/auth/2fa/turn-on', { 
        code: verifyCode.trim(),
      });

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
      await httpPost('/auth/2fa/toggle', {
        enabled: false,
        isTwoFactorEnabled: false,
      });

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
          <button
            onClick={handleStartEnable2FA}
            disabled={loading}
            className="px-4 py-2 rounded-md text-sm font-medium text-white shadow bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Loading...' : 'Enable 2FA'}
          </button>
        ) : (
          <button
            onClick={handleDisable2FA}
            className="px-4 py-2 rounded-md text-sm font-medium text-white shadow bg-red-600 hover:bg-red-700 transition-colors"
          >
            Disable 2FA
          </button>
        )}
      </div>

      {/* QR code scanning and activation modal panel */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border p-6 rounded-lg max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-xl font-semibold">Set up Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground">
              1. Open your authenticator app (like Google Authenticator).<br/>
              2. Scan the QR code below or enter the key manually.
            </p>

            {/* Render QR Code canvas */}
            <div className="flex justify-center p-4 bg-white rounded border">
              {otpauthUrl && <QRCodeCanvas value={otpauthUrl} size={180} />}
            </div>

            <div className="text-xs text-muted-foreground break-all text-center">
              Secret Key: <span className="font-mono font-semibold">{secret}</span>
            </div>

            <form onSubmit={handleVerifyAndTurnOn} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Enter 6-digit code from app:</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="123456"
                  className="w-full mt-1 p-2 border rounded text-center tracking-widest text-lg font-mono"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="flex-1 px-4 py-2 border rounded text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                >
                  {loading ? 'Verifying...' : 'Verify & Turn On'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
