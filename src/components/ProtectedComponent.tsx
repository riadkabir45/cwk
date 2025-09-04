import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedComponentProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({ children, requiredRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return null;

  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(
      role => userRoles.includes(role) || user.primaryRole === role
    );
    if (!hasRequiredRole) return null;
  }

  return <>{children}</>;
};

export default ProtectedComponent;