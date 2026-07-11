import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '../api/auth';

export function ProtectedRoute() {
  const { data: user, isLoading, isError } = useMe();

  if (isLoading) {
    return <div className="page-status">Loading...</div>;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
