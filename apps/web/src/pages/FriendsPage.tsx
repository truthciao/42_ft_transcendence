import { FriendList } from "../components/friends/FriendList";
import { FriendRequests } from "../components/friends/FriendRequests";


export function FriendsPage(){

  return (

    <div className="p-6 space-y-8">

      <div>
        <h1 className="text-2xl font-semibold">
          Friends
        </h1>

        <p className="text-muted-foreground">
          Manage your friends and requests
        </p>
      </div>


      <FriendList />


      <FriendRequests />


    </div>

  );
}
