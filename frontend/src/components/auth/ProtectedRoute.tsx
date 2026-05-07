
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAuthenticated = !!token;

  // If authentication is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is NOT required but user IS authenticated, redirect away
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If a specific role is required
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
