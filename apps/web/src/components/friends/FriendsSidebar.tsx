import { AddFriend } from './AddFriend';
import { FriendsList } from './FriendsList';

export function FriendsSidebar() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-3">
        <AddFriend />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <FriendsList />
      </div>
    </div>
  );
}
