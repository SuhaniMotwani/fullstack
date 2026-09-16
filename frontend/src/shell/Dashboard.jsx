// frontend/src/shell/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';

// Lightweight number count-up animation component using requestAnimationFrame
function CountUp({ end, duration = 900, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let frameId;
    const startVal = 0;
    const targetVal = Number(end) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startVal + (targetVal - startVal) * ease));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        setCount(targetVal);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Dashboard() {
  const { user, org, hasEntitlement } = useAuth();

  const apps = [
    {
      id: 'crm',
      name: 'CRM & Pipeline',
      description: 'Lead generation, opportunity tracking, deal value calculations, and win triggers.',
      path: '/crm',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      accent: 'card-accent-crm',
    },
    {
      id: 'projects',
      name: 'Projects Management',
      description: 'Multi-tenant project planning, budget controls, milestone delivery, and tracking.',
      path: '/projects',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
      accent: 'card-accent-projects',
    },
    {
      id: 'tasks',
      name: 'Task Operations',
      description: 'Starter task generation, task prioritization, status boards, and expense logging.',
      path: '/tasks',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
      accent: 'card-accent-tasks',
    },
    {
      id: 'accounts',
      name: 'Accounts & Invoicing',
      description: 'Automated draft invoice generation from logged expenses, tax, and ledger items.',
      path: '/accounts',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="6" y1="15" x2="10" y2="15" />
        </svg>
      ),
      accent: 'card-accent-accounts',
    },
  ];

  const entitledCount = apps.filter((a) => hasEntitlement(a.id)).length;

  const summaryMetrics = [
    {
      label: 'Active Applications',
      value: entitledCount,
      trend: `${entitledCount} of 4 Available`,
      subtext: 'Workspace entitlements verified',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      label: 'Tenant Isolation',
      value: 100,
      suffix: '%',
      trend: 'Strict RLS Enforced',
      subtext: `Organization: ${org?.name || 'Workspace'}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      label: 'Event Bus Pipelines',
      value: 4,
      trend: 'Synchronous Outbox',
      subtext: 'Decoupled cross-app events',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      label: 'System Availability',
      value: 99,
      suffix: '.9%',
      trend: 'Healthy',
      subtext: 'All services operational',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 14 14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard-view">
      {/* Editorial Welcome Banner (Large Serif Headline, Subtitle, & Right-Side Accent Block) */}
      <div className="dashboard-editorial-banner animate-entrance">
        <div className="banner-left-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
            <span className="badge badge-proposal" style={{ fontSize: '0.72rem' }}>
              {entitledCount === 4 ? 'Multi-App Suite' : 'Standalone App'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 550 }}>
              Tenant Isolation Verified
            </span>
          </div>
          <h1 className="dashboard-serif-title">{org?.name || 'Workspace Overview'}</h1>
          <p className="dashboard-serif-subtitle">
            Welcome back, {user?.firstName || user?.email} — viewing unified platform ecosystem with {entitledCount} of 4 modular applications active.
          </p>
        </div>

        {/* Right-Side Accent-Colored Image or Gradient Block */}
        <div
          className="dashboard-banner-accent"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.3) 0%, rgba(245, 158, 11, 0.4) 100%), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80')`,
            backgroundColor: '#fed7aa',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, padding: '0.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Spatial View</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              ArchScale Studio
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Row with Number Count-Up and Staggered Entrance */}
      <div className="metrics-row">
        {summaryMetrics.map((metric, idx) => (
          <div
            key={metric.label}
            className="metric-card animate-entrance"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="metric-header">
              <span className="metric-label">{metric.label}</span>
              <div className="metric-icon-circle">
                {metric.icon}
              </div>
            </div>
            <div className="metric-value-container">
              <span className="metric-value">
                <CountUp end={metric.value} suffix={metric.suffix || ''} />
              </span>
              <span className="metric-trend">{metric.trend}</span>
            </div>
            <p className="metric-subtext">{metric.subtext}</p>
          </div>
        ))}
      </div>

      {/* Applications Grid */}
      <div className="section-header">
        <h2>Applications & Modules</h2>
        <span className="section-meta">Access is strictly guarded by organization entitlements</span>
      </div>

      <div className="apps-grid">
        {apps.map((app, idx) => {
          const isEntitled = hasEntitlement(app.id);

          if (isEntitled) {
            return (
              <Link
                key={app.id}
                to={app.path}
                className={`app-card animate-entrance ${app.accent}`}
                style={{ animationDelay: `${(idx + 4) * 50}ms` }}
              >
                <div className="card-top">
                  <div className="card-icon">{app.icon}</div>
                  <span className="badge badge-active">Active</span>
                </div>
                <h3 className="card-title">{app.name}</h3>
                <p className="card-desc">{app.description}</p>
                <div className="card-footer">
                  <span className="action-text">Launch App</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </Link>
            );
          }

          return (
            <div
              key={app.id}
              className="app-card card-locked animate-entrance"
              style={{ animationDelay: `${(idx + 4) * 50}ms` }}
            >
              <div className="card-top">
                <div className="card-icon locked-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="badge badge-locked">Not Entitled</span>
              </div>
              <h3 className="card-title">{app.name}</h3>
              <p className="card-desc">{app.description}</p>
              <div className="card-footer locked-footer">
                <span className="locked-text">Requires `{app.id}` Entitlement</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture & Cross-App Event Pipeline Notice */}
      <div className="pipeline-panel animate-entrance" style={{ animationDelay: '400ms' }}>
        <div className="panel-header">
          <div className="panel-icon-circle">⚡</div>
          <div>
            <h3>Synchronous Outbox Event Pipeline</h3>
            <p>Demonstrating cross-app decoupled event automation across the enterprise ecosystem</p>
          </div>
        </div>
        <div className="pipeline-steps">
          <div className="pipeline-step">
            <div className="step-num">1</div>
            <div className="step-content">
              <strong>CRM: Opportunity Won</strong>
              <span>`OPPORTUNITY_WON` published on lead won</span>
            </div>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step">
            <div className="step-num">2</div>
            <div className="step-content">
              <strong>Projects: Auto-Provisioning</strong>
              <span>Creates project & publishes `PROJECT_CREATED`</span>
            </div>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step">
            <div className="step-num">3</div>
            <div className="step-content">
              <strong>Tasks: Starter Tasks & Expense</strong>
              <span>Generates starter tasks; `EXPENSE_LOGGED`</span>
            </div>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step">
            <div className="step-num">4</div>
            <div className="step-content">
              <strong>Accounts: Draft Invoice</strong>
              <span>Auto-creates draft invoice for contact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
