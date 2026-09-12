import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Protects a route: redirects to /login if not authenticated. Optionally
// restrict to a set of allowed role names — the backend still re-checks
// every permission, this is purely for UX (hides nav/routes the user can't use).
export default function AuthGuard({ children, allowedRoles = null }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
