import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PageLoader } from './Spinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((s) => s.auth);
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((s) => s.auth);
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;
