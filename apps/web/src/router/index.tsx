import {
  createBrowserRouter,
  Navigate,
  type LoaderFunctionArgs,
} from 'react-router';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RootLayout } from '../layouts/RootLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AppLayout } from '@/layouts/AppLayout';
import {
  ChatEmptyState,
  ChatPage,
  ConversationListSidebar,
  ConversationPage,
} from '@/pages/app/ChatPage';
import { FriendsPage } from '@/pages/FriendsPage';
import { FriendsSidebar } from '@/components/friends/FriendsSidebar';
import { FriendProfilePage } from '@/pages/FriendProfilePage';
import {
  SpacesPage,
  SpacesSidebar,
  SpaceDetailPage,
  SpaceChannelPage,
  SpaceMembersPage,
  SpaceSettingsPage,
} from '@/pages/app/SpacesPage';
import {
  SettingsPage,
  SettingsSidebar,
  AccountSettingsPage,
  NotificationSettingsPage,
} from '@/pages/app/SettingsPage';
import { InvitePage } from '@/pages/app/InvitePage';

function workspaceLoader({ params }: LoaderFunctionArgs) {
  return { workspaceId: params.workspaceId };
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/app/chat" replace /> },
          {
            path: 'chat',
            element: <ChatPage />,
            handle: { SecondarySidebar: () => <ConversationListSidebar /> },
            children: [
              { index: true, element: <ChatEmptyState /> },
              { path: ':conversationId', element: <ConversationPage /> },
            ],
          },
          {
            path: 'friends',
            element: <FriendsPage />,
            handle: { secondarySidebar: () => <FriendsSidebar /> },
          },
          {
            path: 'friends/:userId',
            element: <FriendProfilePage />,
            handle: { secondarySidebar: () => <FriendsSidebar /> },
          },
          {
            path: 'spaces',
            element: <SpacesPage />,
            handle: { secondarySidebar: () => <SpacesSidebar /> },
          },
          {
            path: 'spaces/:workspaceId',
            loader: workspaceLoader,
            element: <SpaceDetailPage />,
            handle: { secondarySidebar: () => <SpacesSidebar /> },
          },
          {
            path: 'spaces/:workspaceId/c/:channelId',
            loader: workspaceLoader,
            element: <SpaceChannelPage />,
            handle: { secondarySidebar: () => <SpacesSidebar /> },
          },
          {
            path: 'spaces/:workspaceId/members',
            loader: workspaceLoader,
            element: <SpaceMembersPage />,
            handle: { secondarySidebar: () => <SpacesSidebar /> },
          },
          {
            path: 'spaces/:workspaceId/settings',
            loader: workspaceLoader,
            element: <SpaceSettingsPage />,
            handle: { secondarySidebar: () => <SpacesSidebar /> },
          },
          {
            path: 'settings',
            element: <SettingsPage />,
            handle: { secondarySidebar: () => <SettingsSidebar /> },
          },
          {
            path: 'settings/profile',
            element: <ProfilePage />,
            handle: { secondarySidebar: () => <SettingsSidebar /> },
          },
          {
            path: 'settings/account',
            element: <AccountSettingsPage />,
            handle: { secondarySidebar: () => <SettingsSidebar /> },
          },
          {
            path: 'settings/notifications',
            element: <NotificationSettingsPage />,
            handle: { secondarySidebar: () => <SettingsSidebar /> },
          },
          { path: 'invite/:inviteToken', element: <InvitePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
