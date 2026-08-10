export function SpacesSidebar() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Spaces</h3>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-2 rounded hover:bg-muted cursor-pointer">
            Space {i}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SpacesPage() {
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Spaces</h2>
      <p className="text-muted-foreground mt-2">Spaces list</p>
    </div>
  );
}

export function SpaceDetailPage() {
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Space Details</h2>
      <p className="text-muted-foreground mt-2">Space detail content</p>
    </div>
  );
}

export function SpaceChannelPage() {
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Channel</h2>
      <p className="text-muted-foreground mt-2">Channel content</p>
    </div>
  );
}

export function SpaceMembersPage() {
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Members</h2>
      <p className="text-muted-foreground mt-2">Members list</p>
    </div>
  );
}

export function SpaceSettingsPage() {
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Space Settings</h2>
      <p className="text-muted-foreground mt-2">Settings here</p>
    </div>
  );
}
