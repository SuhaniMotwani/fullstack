// frontend/src/shell/AppShell.jsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../core/auth/AuthContext';

export default function AppShell({ children }) {
  const { user, org, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getHeaderInfo = (pathname) => {
    if (pathname.startsWith('/crm')) {
      return {
        title: 'CRM & Pipeline',
        subtitle: 'Lead tracking, stage progression & deal automation',
      };
    }
    if (pathname.startsWith('/projects')) {
      return {
        title: 'Projects Management',
        subtitle: 'Multi-tenant project provisioning & cross-app pipeline',
      };
    }
    if (pathname.startsWith('/tasks')) {
      return {
        title: 'Tasks Operations',
        subtitle: 'Workflow tracking, task assignment & expense logging',
      };
    }
    if (pathname.startsWith('/accounts')) {
      return {
        title: 'Accounts & Billing',
        subtitle: 'Automated invoice generation & financial ledger',
      };
    }
    if (pathname.startsWith('/contacts')) {
      return {
        title: 'Contacts Directory',
        subtitle: 'Platform-wide unified contact directory & cross-app linking',
      };
    }
    return {
      title: 'Overview',
      subtitle: 'Modular multi-tenant platform & system analytics',
    };
  };

  const headerInfo = getHeaderInfo(location.pathname);
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="app-layout">
      {/* Soft Ambient Blurred Gradient Color Blobs for Depth */}
      <div className="ambient-glow-blobs" aria-hidden="true">
        <div className="glow-blob blob-indigo" />
        <div className="glow-blob blob-emerald" />
        <div className="glow-blob blob-violet" />
      </div>

      {/* Dynamic Sidebar */}
      <Sidebar />

      {/* Content Area */}
      <div className="main-viewport">
        {/* Top Header matching reference composition */}
        <header className="top-header">
          <div className="header-left">
            <h1 className="header-page-title">{headerInfo.title}</h1>
            <p className="header-page-subtitle">{headerInfo.subtitle}</p>
          </div>

          <div className="header-right">
            {/* Date Pill */}
            <div className="top-bar-date-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Today, {formattedDate}</span>
            </div>

            {/* Organization Name Badge */}
            <div className="top-bar-org-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span className="top-bar-org-name">{org?.name || 'Workspace'}</span>
            </div>

            {/* Notification Bell Icon */}
            <button className="icon-btn" title="Notifications" aria-label="Notifications">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            {/* Logout Action Button */}
            <button
              onClick={handleLogout}
              className="icon-btn"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="content-container">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
