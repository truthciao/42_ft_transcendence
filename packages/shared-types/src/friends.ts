export interface Friend {
  id: number;
  username: string;
  email: string;
}

export interface SendFriendRequestDto {
  addresseeId: number;
}

export interface MessageResponse {
  message: string;
}

export interface PendingRequest {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: 'PENDING';
  createdAt: string;

  requester: {
    id: number;
    username: string;
    email: string;
  };
}
