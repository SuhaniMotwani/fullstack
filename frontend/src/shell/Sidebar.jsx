// frontend/src/shell/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';

export default function Sidebar() {
  const { user, org, hasEntitlement } = useAuth();

  const enabledApps = ['crm', 'projects', 'tasks', 'accounts'].filter((code) => hasEntitlement(code));
  const isMultiApp = enabledApps.length === 4;
  const isStandalone = enabledApps.length === 1 && enabledApps[0] === 'projects';

  const userInitials = (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email || 'User';

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div className="brand-name">ArchScale</div>
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        <div className="nav-group-title">Platform</div>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/contacts"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Contacts</span>
        </NavLink>

        {enabledApps.length > 0 && (
          <>
            <div className="nav-group-title">Apps</div>

            {/* CRM */}
            {hasEntitlement('crm') && (
              <NavLink
                to="/crm"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>CRM & Leads</span>
              </NavLink>
            )}

            {/* Projects */}
            {hasEntitlement('projects') && (
              <NavLink
                to="/projects"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span>Projects</span>
              </NavLink>
            )}

            {/* Tasks */}
            {hasEntitlement('tasks') && (
              <NavLink
                to="/tasks"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <span>Tasks</span>
              </NavLink>
            )}

            {/* Accounts */}
            {hasEntitlement('accounts') && (
              <NavLink
                to="/accounts"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <line x1="6" y1="15" x2="10" y2="15" />
                </svg>
                <span>Accounts</span>
              </NavLink>
            )}
          </>
        )}
      </nav>

      {/* User Profile Docked at Bottom */}
      <div className="sidebar-user-dock">
        <div className="user-profile-row">
          <div className="avatar-image-circle">{userInitials}</div>
          <div className="user-meta-info">
            <div className="user-full-name">{displayName}</div>
            <div className="user-role-text">{user?.role || 'Member'} · {org?.name || 'Workspace'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
