import { httpDelete, httpGet, httpPost } from '../lib/http';
import type {
  Friend,
  PendingRequest,
  SendFriendRequestDto,
  MessageResponse,
  UserSearchResult,
  SentPendingRequest,
} from '@repo/shared-types';

export function getFriends() {
  return httpGet<Friend[]>('/friends');
}

export function getPendingRequests() {
  return httpGet<PendingRequest[]>('/friends/requests');
}

export function getSentPendingRequests() {
  return httpGet<SentPendingRequest[]>('/friends/requests/sent');
}

export function searchUsers(username: string) {
  return httpGet<UserSearchResult[]>(
    `/users/search?username=${encodeURIComponent(username)}`,
  );
}

export function sendFriendRequest(data: SendFriendRequestDto) {
  return httpPost('/friends/requests', data);
}

export function acceptFriendRequest(requestId: number) {
  return httpPost(`/friends/requests/${requestId}/accept`);
}

export function rejectFriendRequest(requestId: number) {
  return httpPost<MessageResponse>(`/friends/requests/${requestId}/reject`);
}

export function removeFriend(userId: number) {
  return httpDelete<MessageResponse>(`/friends/${userId}`);
}
