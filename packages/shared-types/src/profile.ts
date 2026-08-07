export interface ProfilePayload {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  preferredLanguage?: string;
}

interface ProfileResponse extends ProfilePayload {
  user?: {
    username: string;
    email: string;
  }
}
