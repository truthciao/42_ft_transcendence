import { FriendList } from "../components/friends/FriendList";
import { FriendRequests } from "../components/friends/FriendRequests";

export function FriendsPage() {
  return (
    <div className="p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          Friends
        </h1>

        <p className="text-muted-foreground">
          Manage your friends and requests.
        </p>
      </header>

      <section className="space-y-4">
        <FriendRequests />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          Your Friends
        </h2>

        <FriendList />
      </section>
    </div>
  );
}
