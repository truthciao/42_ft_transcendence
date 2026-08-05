import { useFriends } from "../../hooks/useFriends";


export function FriendList(){

  const {
    data:friends,
    isLoading,
  } = useFriends();


  if(isLoading){
    return <p>Loading...</p>;
  }


  return (

    <div className="space-y-3">

      {friends?.map(friend=>(

        <div
          key={friend.id}
          className="
          border
          rounded
          p-4
          "
        >

          {friend.username}

        </div>

      ))}

    </div>

  );
}