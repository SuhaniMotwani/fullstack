// frontend/src/core/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children, requiredApp }) {
  const { isAuthenticated, loading, hasEntitlement, org } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner-large"></div>
        <p className="loading-text">Authenticating session & entitlements...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific app is required, verify entitlement
  if (requiredApp && !hasEntitlement(requiredApp)) {
    return (
      <div className="unentitled-container">
        <div className="unentitled-card">
          <div className="unentitled-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2>App Access Restricted</h2>
          <p className="unentitled-desc">
            Your organization <strong>{org?.name || 'Current Organization'}</strong> is not entitled to access the <strong>{requiredApp.toUpperCase()}</strong> application.
          </p>
          <div className="unentitled-pill">
            Entitlement Code: <code>{requiredApp}</code> (Status: Inactive / Not Purchased)
          </div>
          <div className="unentitled-actions">
            <Link to="/" className="btn btn-primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
