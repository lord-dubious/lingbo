
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profiles } = useUser();
  if (profiles.length === 0) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

export default RequireAuth;
