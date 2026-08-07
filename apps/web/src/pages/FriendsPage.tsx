import { useState } from 'react';
import { AddFriend } from '../components/friends/AddFriend';
import { FriendList } from '../components/friends/FriendList';
import { FriendRequests } from '../components/friends/FriendRequests';

export function FriendsPage() {
  const [showAddFriend, setShowAddFriend] = useState(false);

  return (
    <div className="p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Friends</h1>

        <p className="text-muted-foreground">
          Manage your friends and requests.
        </p>

        <button
          className="
            rounded
            bg-primary
            px-4
            py-2
            text-primary-foreground
          "
          onClick={() => setShowAddFriend((prev) => !prev)}
        >
          {showAddFriend ? 'Close' : 'Add Friend'}
        </button>
      </header>

      {showAddFriend && <AddFriend />}

      <FriendRequests />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Friends</h2>

        <FriendList />
      </section>
    </div>
  );
}
