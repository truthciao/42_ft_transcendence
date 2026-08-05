import { useQuery } from "@tanstack/react-query";
import {
  getFriends,
  getPendingRequests,
} from "../api/friends";


export function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });
}


export function useFriendRequests() {
  return useQuery({
    queryKey: ["friendRequests"],
    queryFn: getPendingRequests,
  });
}