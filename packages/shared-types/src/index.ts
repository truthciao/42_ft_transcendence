export {
  emailSchema,
  usernameSchema,
  passwordSchema,
  twoFactorCodeSchema,
  registerSchema,
  loginSchema,
  twoFactorLoginSchema,
  twoFactorCodePayloadSchema,
  authUserSchema,
  authSuccessResponseSchema,
  twoFactorRequiredResponseSchema,
  authResponseSchema,
  registerResponseSchema,
  twoFactorGenerateResponseSchema,
} from './auth.js';

export type {
  RegisterPayload,
  LoginPayload,
  TwoFactorLoginPayload,
  TwoFactorCodePayload,
  AuthUser,
  AuthSuccessResponse,
  TwoFactorRequiredResponse,
  AuthResponse,
  RegisterResponse,
  TwoFactorGenerateResponse,
} from './auth.js';

export {
  createConversationSchema,
  sendMessageSchema,
  joinConversationSchema,
  getMessagesSchema,
} from './chat.js';

export type {
  CreateConversationPayload,
  SendMessagePayload,
  GetMessagesPayload,
} from './chat.js';

export {
  friendSchema,
  sendFriendRequestSchema,
  messageResponseSchema,
  pendingRequestSchema,
  sentPendingRequestSchema,
  addFriendSearchSchema,
} from './friends.js';

export type {
  Friend,
  FriendRequest,
  PendingRequest,
  SentPendingRequest,
  SendFriendRequestDto,
  MessageResponse,
  AddFriendSearchValues,
} from './friends.js';

export {
  updateProfileSchema,
  profileResponseSchema,
  profileFormSchema,
} from './profile.js';

export type {
  UpdateProfilePayload,
  ProfileResponse,
  ProfileFormValues,
} from './profile.js';

export {
  userSchema,
  createUserSchema,
  currentUserSchema,
  userSearchResultSchema,
} from './users.js';

export type {
  User,
  CreateUserPayload,
  CurrentUser,
  UserSearchResult,
} from './users.js';

export { roomSchema } from './realtime.js';

export type { RoomPayload } from './realtime.js';

export * from './workspaces.js';

export {
  documentSchema,
  createDocumentSchema,
  updateDocumentSchema,
} from './documents.js';

export type {
  Document,
  CreateDocumentPayload,
  UpdateDocumentPayload,
} from './documents.js';

export {
  notificationTypeSchema,
  notificationPreferenceSchema,
  updateNotificationPreferencesSchema,
  notificationActorSchema,
  notificationWorkspaceSchema,
  notificationSchema,
  notificationsSchema,
} from './notifications.js';

export type {
  NotificationType,
  NotificationPreference,
  UpdateNotificationPreferences,
  Notification,
} from './notifications.js';
