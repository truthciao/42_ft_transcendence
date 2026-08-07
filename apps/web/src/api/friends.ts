import { httpDelete, httpGet, httpPost } from "../lib/http";

export interface Friend {
  id: number;
  username: string;
  email: string;
}

export interface PendingRequest {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: "PENDING";
  createdAt: string;

  requester: {
    id: number;
    username: string;
    email: string;
  };
}

export interface SendFriendRequestDto {
  addresseeId: number;
}

export interface MessageResponse {
  message: string;
}

export function getFriends() {
  return httpGet<Friend[]>("/friends");
}

export function getPendingRequests() {
  return httpGet<PendingRequest[]>("/friends/requests");
}

export function sendFriendRequest(data: SendFriendRequestDto) {
  return httpPost("/friends/requests", data);
}

export function acceptFriendRequest(requestId: number) {
  return httpPost(`/friends/requests/${requestId}/accept`);
}

export function rejectFriendRequest(requestId: number) {
  return httpPost<MessageResponse>(
    `/friends/requests/${requestId}/reject`,
  );
}

export function removeFriend(userId: number) {
  return httpDelete<MessageResponse>(`/friends/${userId}`);
}