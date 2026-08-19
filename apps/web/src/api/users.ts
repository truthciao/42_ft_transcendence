import { httpGet } from '@/lib/http';
import type { User, CurrentUser } from '@repo/shared-types';

export function getCurrentUser() {
  return httpGet<CurrentUser>('/users/me');
}

export function getUsers() {
  return httpGet<User[]>('/users');
}
