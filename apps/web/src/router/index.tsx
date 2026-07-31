import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ProfilePage } from '../pages/ProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/ProtectedRoute';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
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
]);