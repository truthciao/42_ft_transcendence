import { httpGet } from '@/lib/http';
import type { User } from '@repo/shared-types';

export function getCurrentUser() {
  return httpGet<User>('/users/me');
}

export function getUsers() {
  return httpGet<User[]>('/users');
}
