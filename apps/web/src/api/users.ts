import { httpGet } from "@/lib/http";

export interface User {
  id: number;
  username: string;
  email: string;
}

export function getCurrentUser() {
  return httpGet<User>("/users/me");
}

export function getUsers() {
  return httpGet<User[]>("/users");
}
