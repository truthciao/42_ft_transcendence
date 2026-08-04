import { httpGet } from "@/lib/http";

export interface CurrentUser {
  id: number;
  email: string;
  username: string;
}

export function getCurrentuser() {
  return httpGet<CurrentUser>('/users/me');
}
