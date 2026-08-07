export interface ProfilePayload {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
}

export interface ProfileResponse extends ProfilePayload {
  user?: {
    username: string;
    email: string;
  };
}
