import { useParams, useNavigate } from "react-router";
import { useFriends } from "../hooks/useFriends";


export function FriendProfilePage() {

  const { id } = useParams();

  const navigate = useNavigate();


  const {
    data: friends,
    isLoading,
    isError,
  } = useFriends();



  if (isLoading) {
    return (
      <div className="p-6">
        Loading profile...
      </div>
    );
  }



  if (isError) {
    return (
      <div className="p-6 text-destructive">
        Failed to load profile.
      </div>
    );
  }



  const friend = friends?.find(
    (friend) => friend.id === Number(id)
  );



  if (!friend) {
    return (
      <div className="p-6">

        <h1 className="text-xl font-semibold">
          Friend not found
        </h1>


        <button
          className="
            mt-4
            px-4
            py-2
            rounded
            border
          "
          onClick={() => navigate("/friends")}
        >
          Back to Friends
        </button>

      </div>
    );
  }



  return (

    <div className="flex-1 bg-background p-6">


      <button
        className="
          mb-6
          text-sm
          text-muted-foreground
          hover:underline
        "
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>



      <div
        className="
          max-w-md
          border
          rounded-lg
          p-6
          space-y-6
        "
      >


        <div
          className="
            flex
            items-center
            gap-4
          "
        >

          <div
            className="
              w-16
              h-16
              rounded-full
              bg-muted
              flex
              items-center
              justify-center
              text-xl
              font-semibold
            "
          >
            {friend.username[0]}
          </div>



          <div>

            <h1 className="text-2xl font-semibold">
              {friend.username}
            </h1>


            <p className="text-muted-foreground">
              Friend
            </p>

          </div>


        </div>



        <div className="space-y-3">


          <div>

            <p className="text-sm text-muted-foreground">
              Username
            </p>

            <p className="font-medium">
              {friend.username}
            </p>

          </div>



          <div>

            <p className="text-sm text-muted-foreground">
              Email
            </p>

            <p className="font-medium">
              {friend.email}
            </p>

          </div>


        </div>



        <div className="flex gap-3">


          <button
            className="
              flex-1
              px-4
              py-2
              rounded
              bg-primary
              text-primary-foreground
            "
          >
            Message
          </button>



          <button
            className="
              px-4
              py-2
              rounded
              border
            "
          >
            Remove Friend
          </button>


        </div>



      </div>


    </div>

  );
}