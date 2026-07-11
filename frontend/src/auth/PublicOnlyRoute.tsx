import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '../api/auth';

export function PublicOnlyRoute() {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return <div className="page-status">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
