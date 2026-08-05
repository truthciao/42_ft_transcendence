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