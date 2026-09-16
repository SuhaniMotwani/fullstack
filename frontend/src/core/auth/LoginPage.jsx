// frontend/src/core/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="login-container">
      {/* Soft Ambient Blurred Gradient Color Blobs for Depth */}
      <div className="ambient-glow-blobs" aria-hidden="true">
        <div className="glow-blob blob-indigo" />
        <div className="glow-blob blob-emerald" />
        <div className="glow-blob blob-violet" />
      </div>

      <div className="login-editorial-card">
        {/* Left Column: Form & Tenant Quick-Select */}
        <div className="login-form-col">
          {/* Brand Header */}
          <div className="brand-header" style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div className="brand-logo" style={{ width: '42px', height: '42px', borderRadius: '12px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <h1 className="brand-title" style={{ fontSize: '1.65rem', marginBottom: 0 }}>ArchScale</h1>
            </div>
            <p className="brand-subtitle">Sign in to your modular workspace & enterprise platform</p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="alert alert-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@orgb.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Primary Sign In Button styled with warm amber accent */}
            <button
              type="submit"
              className="btn btn-amber-pill btn-block"
              disabled={isSubmitting}
              style={{ padding: '0.72rem 1.4rem', fontSize: '0.92rem' }}
            >
              {isSubmitting ? (
                <span className="btn-spinner">Signing In...</span>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="demo-credentials-section">
            <div className="demo-divider">
              <span>Quick Select Pre-Seeded Tenant</span>
            </div>
            <div className="demo-buttons-grid">
              <button
                type="button"
                className="btn btn-outline demo-btn"
                onClick={() => handleQuickFill('admin@orgb.com', 'Password123!')}
                disabled={isSubmitting}
              >
                <div className="demo-btn-title">Org B (Multi-App Suite)</div>
                <div className="demo-btn-desc">CRM, Projects, Tasks, Accounts, Contacts</div>
              </button>
              <button
                type="button"
                className="btn btn-outline demo-btn"
                onClick={() => handleQuickFill('admin@orga.com', 'Password123!')}
                disabled={isSubmitting}
              >
                <div className="demo-btn-title">Org A (Standalone)</div>
                <div className="demo-btn-desc">Projects & Platform Contacts</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Warm Editorial Hero Section with Serif Display & Photo Collage */}
        <div className="login-editorial-col">
          <div className="editorial-header-wrap">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span className="badge badge-draft" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontSize: '0.72rem' }}>
                ARCHITECTURE & DESIGN PLATFORM
              </span>
            </div>
            <h2 className="editorial-serif-headline">
              Every discipline. <span className="editorial-accent">One</span> platform.
            </h2>
            <p className="editorial-subtitle">
              Seamlessly unify architectural management, structural pipelines, starter task automation, and financial billing.
            </p>
          </div>

          {/* Editorial Photo Collage: Mixed Square / Circular Crops with Generous Corners */}
          <div className="editorial-collage-grid">
            {/* Tile 1: Architectural Staircase & Minimalist Interior */}
            <div
              className="collage-tile collage-tile-main"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(15,23,42,0.35) 100%), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80')`,
                backgroundColor: '#e2e8f0',
              }}
            >
              <div style={{ position: 'absolute', bottom: '1rem', left: '1.15rem', color: '#ffffff' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>Spatial Execution</span>
                <strong style={{ display: 'block', fontSize: '0.9rem', letterSpacing: '-0.01em' }}>Studio Atelier Residence</strong>
              </div>
            </div>

            {/* Tile 2: Circular Architectural Crop */}
            <div
              className="collage-tile collage-tile-circle"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80')`,
                backgroundColor: '#fed7aa',
              }}
              title="Interior Detail"
            />

            {/* Tile 3: Square Modern Pavilion Tile */}
            <div
              className="collage-tile collage-tile-square"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=500&q=80')`,
                backgroundColor: '#cbd5e1',
              }}
            />
          </div>

          {/* Collage Footnote Tag */}
          <div className="collage-tile-tag">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)' }} />
              <span>Multi-Tenant Architecture Directory</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>ArchScale v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
