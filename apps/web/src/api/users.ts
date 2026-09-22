import { httpGet, httpPatch, httpDelete } from '@/lib/http';
import type {
  User,
  AdminUser,
  CurrentUser,
  PublicUserProfile,
  UserRole,
} from '@repo/shared-types';

export interface TestUser {
  id: number;
  username: string;
  email: string;
}

export function getTestUsers() {
  return httpGet<TestUser[]>('/users/test-users');
}

export function getCurrentUser() {
  return httpGet<CurrentUser>('/users/me');
}

export function getUsers() {
  return httpGet<User[]>('/users');
}

export function getAdminUsers() {
  return httpGet<AdminUser[]>('/users/admin');
}

export function updateUserRole(userId: number, role: UserRole) {
  return httpPatch<AdminUser>(`/users/${userId}/role`, { role });
}

export function deleteUser(userId: number) {
  return httpDelete<{ message: string }>(`/users/${userId}`);
}

export function getUserProfile(userId: number) {
  return httpGet<PublicUserProfile>(`/users/${userId}/profile`);
}

export function searchUsers(username: string, limit = 20, offset = 0) {
  return httpGet<{
    users: User[];
    hasMore: boolean;
  }>(
    `/users/search?username=${encodeURIComponent(username)}&limit=${limit}&offset=${offset}`,
  );
}
