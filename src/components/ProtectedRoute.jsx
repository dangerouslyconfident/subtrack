import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Wrapper
 * If a user is NOT logged in, attempting to view a protected route
 * will automatically redirect them to the Login page.
 */
export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    // Replace prevents the user from going back to the protected route with the back button
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
