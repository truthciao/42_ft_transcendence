export function FriendsSidebar() {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Friends</h3>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-2 rounded hover:bg-muted cursor-pointer">
            Friend {i}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FriendsPage() {
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Friends</h2>
      <p className="text-muted-foreground mt-2">Friends list content</p>
    </div>
  );
}

export function FriendProfilePage() {
  return (
    <div className="flex-1 bg-background p-4">
      <h2 className="text-2xl font-semibold">Friend Profile</h2>
      <p className="text-muted-foreground mt-2">Profile details here</p>
    </div>
  );
}
