import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Splash from './splash';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash label="Loading…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
};

export default ProtectedRoute;
