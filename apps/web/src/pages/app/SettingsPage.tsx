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
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Account Settings</h2>
      <p className="text-muted-foreground mt-2">Account settings content</p>
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
