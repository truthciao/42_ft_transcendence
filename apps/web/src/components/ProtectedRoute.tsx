import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  // Check if the user is authenticated by checking for the presence of an access token in localStorage
  const isAuthenticated = Boolean(localStorage.getItem('access_token'));

  // If the user is not authenticated, redirect them to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the protected route
  return <Outlet />;
}