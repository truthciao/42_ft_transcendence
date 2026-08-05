import { createBrowserRouter, Navigate, type LoaderFunctionArgs } from 'react-router';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RootLayout } from '../layouts/RootLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AppLayout } from '@/layouts/AppLayout';
import { ChatEmptyState, ChatPage, ConversationListSidebar, ConversationPage } from '@/pages/app/ChatPage';
import { SecondarySidebar } from '@/components/layout/SecondarySidebar';

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
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/app/chat" replace /> },
          {
            path: "chat",
            element: <ChatPage />,
            handle: { SecondarySidebar: () => <ConversationListSidebar /> },
            children: [
              {index: true, element: <ChatEmptyState />},
              {path: ":conversationId", element: <ConversationPage /> },
            ]
          }
        ]
      }
    ]
  },
  { path: "*", element: <NotFoundPage /> },
]);
