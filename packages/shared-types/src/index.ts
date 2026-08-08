export {
  registerSchema,
  loginSchema,
  authUserSchema,
  authResponseSchema,
} from './auth.js';

export type {
  RegisterPayload,
  LoginPayload,
  AuthUser,
  AuthResponse,
} from './auth.js';

export {
  friendSchema,
  sendFriendRequestSchema,
  messageResponseSchema,
  pendingRequestSchema,
} from './friends.js';

export type {
  Friend,
  PendingRequest,
  SendFriendRequestDto,
  MessageResponse,
} from './friends.js';

export {
  updateProfileSchema,
  profileResponseSchema,
} from './profile.js';

export type {
  UpdateProfilePayload,
  ProfileResponse,
} from './profile.js';

export { userSchema } from './users.js';
export type { User } from './users.js';
