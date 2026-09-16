// frontend/src/core/auth/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to check if a specific app is entitled and enabled
  const hasEntitlement = useCallback((appSlug) => {
    if (!appSlug || !Array.isArray(entitlements)) return false;
    const match = entitlements.find(
      (e) => (e.app_slug || e.appSlug)?.toLowerCase() === appSlug.toLowerCase()
    );
    return Boolean(match && match.enabled !== false);
  }, [entitlements]);

  // Fetch full user, org, permissions, and entitlements from /api/auth/me
  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setOrg(null);
      setEntitlements([]);
      setPermissions([]);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/auth/me');
      const data = res.data;

      setUser(data.user || null);
      setOrg(data.organization || null);
      setPermissions(data.permissions || []);

      let tenantEntitlements = data.entitlements || [];
      // Fallback query to /api/entitlements if /me didn't contain them
      if (!tenantEntitlements || tenantEntitlements.length === 0) {
        try {
          const entRes = await apiClient.get('/entitlements');
          tenantEntitlements = entRes.data || [];
        } catch (entErr) {
          console.warn('[AuthContext] Could not fetch secondary entitlements:', entErr);
        }
      }

      setEntitlements(tenantEntitlements);
      return data;
    } catch (err) {
      console.error('[AuthContext] Failed to load authenticated user profile:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setOrg(null);
      setEntitlements([]);
      setPermissions([]);
      setError(err.response?.data?.error || 'Session expired. Please log in again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await apiClient.post('/auth/login', {
        email: email.trim(),
        password,
      });

      const { token: receivedToken, user: receivedUser, organization: receivedOrg } = res.data;
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      setOrg(receivedOrg);

      // Refresh to load full entitlements & permissions from /me
      await refreshUser();
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setOrg(null);
    setEntitlements([]);
    setPermissions([]);
    setError(null);
  }, []);

  // Sync state and handle global session expiration
  useEffect(() => {
    refreshUser();

    const handleSessionExpired = () => {
      logout();
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session_expired', handleSessionExpired);
    };
  }, [refreshUser, logout]);

  const value = {
    token,
    user,
    org,
    organization: org,
    entitlements,
    permissions,
    loading,
    error,
    login,
    logout,
    refreshUser,
    hasEntitlement,
    isAuthenticated: Boolean(token && user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
