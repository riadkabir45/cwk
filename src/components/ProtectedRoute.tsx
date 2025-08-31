import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { user, loading, session, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Check if token is expired
  const token = session?.access_token
  const expiresAt = session?.expires_at
  const now = Math.floor(Date.now() / 1000)
  if (!token || (expiresAt && expiresAt < now)) {
    signOut && signOut()
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Check role-based access if required roles are specified
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user.roles || []
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role) || user.primaryRole === role
    )

    if (!hasRequiredRole) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
