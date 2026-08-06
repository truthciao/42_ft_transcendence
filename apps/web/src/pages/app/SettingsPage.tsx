import React, { useState } from 'react';

export function SettingsSidebar() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Settings</h3>
      <div className="space-y-2">
        <div className="p-2 rounded hover:bg-muted cursor-pointer">Profile</div>
        <div className="p-2 rounded hover:bg-muted cursor-pointer">Account</div>
        <div className="p-2 rounded hover:bg-muted cursor-pointer">Notifications</div>
      </div>
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

  const handleToggle2FA = async () => {
    const nextState = !isTwoFactorEnabled;
    setIsTwoFactorEnabled(nextState);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/auth/2fa/toggle', { // 换成你实际的后端路由
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ enabled: nextState })
      });

      if (response.ok) {
        setIsTwoFactorEnabled(nextState); // 后端更新成功后，前端才改变状态
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update 2FA status');
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      alert('Network error');
    }
  };

  return (
    <div className="flex-1 bg-background p-4 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Account Settings</h2>
        <p className="text-muted-foreground mt-2">Manage your account security and preferences</p>
      </div>

      <div className="p-4 border rounded-lg bg-card flex items-center justify-between max-w-xl">
        <div>
          <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
          <p className="text-sm text-muted-foreground">
            Status: {isTwoFactorEnabled ? '✅ Enabled' : '❌ Disabled'}
          </p>
        </div>
        <button
          onClick={handleToggle2FA}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white shadow transition-colors ${
            isTwoFactorEnabled 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>
    </div>
  );
}

export function NotificationSettingsPage() {
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Notification Settings</h2>
      <p className="text-muted-foreground mt-2">Notification settings content</p>
    </div>
  );
}