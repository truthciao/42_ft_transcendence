import {
  createBrowserRouter,
  Navigate,
} from 'react-router';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/app/ProfilePage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RootLayout } from '../layouts/RootLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AppLayout } from '@/layouts/AppLayout';
import {
  ChatEmptyState,
  ChatPage,
  ConversationPage,
} from '@/pages/app/ChatPage';
import { ConversationListSidebar } from '@/components/chat/ChatSidebar';
import { FriendsPage } from '@/pages/app/FriendsPage';
import { FriendsSidebar } from '@/components/friends/FriendsSidebar';
import { FriendProfilePage } from '@/pages/app/FriendProfilePage';
import { SpacesIndexPage } from '@/pages/app/spaces/SpacesIndexPage';
import { SpaceDetailPage } from '@/pages/app/spaces/SpaceDetailPage';
import { SpaceMembersPage } from '@/pages/app/spaces/SpaceMembersPage';
import { SpaceSettingPage } from '@/pages/app/spaces/SpaceSettingsPage';
import { SpaceChannelPage } from '@/pages/app/spaces/SpaceChannelPage';
import { SpacesSidebar } from '@/components/workspaces/SpacesSidebar';
import { WorkspaceGuard } from '@/components/workspaces/WorkspaceGuard';
import {
  SettingsPage,
  SettingsSidebar,
  AccountSettingsPage,
  NotificationSettingsPage,
} from '@/pages/app/SettingsPage';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { ComponentShowcasePage } from '@/pages/dev/ComponentShowcasePage';
import { DocumentPage } from '@/pages/app/spaces/DocumentPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/showcase', element: <ComponentShowcasePage /> },
      { path: '/privacy', element: <PrivacyPolicyPage /> },
      { path: '/terms', element: <TermsOfServicePage /> },
    ],
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { index: true, element: <Navigate to="/app/chat" replace /> },
          {
            path: 'chat',
            element: <ChatPage />,
            handle: { secondarySidebar: () => <ConversationListSidebar /> },
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
            element: <SpacesIndexPage />,
            handle: { secondarySidebar: () => <SpacesSidebar /> },
          },
          {
            path: 'spaces/:workspaceId',
            element: <WorkspaceGuard />,
            handle: { secondarySidebar: () => <SpacesSidebar /> },
            children: [
              { index: true, element: <SpaceDetailPage /> },
              { path: 'c/:channelId', element: <SpaceChannelPage /> },
              { path: 'members', element: <SpaceMembersPage /> },
              { path: 'settings', element: <SpaceSettingPage /> },
              {
                path: 'documents/:documentId',
                element: <DocumentPage />,
              },
            ],
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
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
