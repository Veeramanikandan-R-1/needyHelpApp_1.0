import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Splash from './splash';

// Route guard that requires the user to have one of the given roles.
const RoleRoute = ({ roles = [], children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Splash label="Checking access…" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default RoleRoute;
