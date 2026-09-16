// frontend/src/apps/projects/ProjectsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import projectsApi from './api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [flashingIds, setFlashingIds] = useState(new Set());

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    status: 'planning',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track initial load to prevent flickering on 3s background polls
  const isFirstLoad = useRef(true);
  const previousIdsRef = useRef(null);

  const fetchProjects = async () => {
    try {
      if (isFirstLoad.current) {
        setLoading(true);
      }
      const data = await projectsApi.listProjects();
      const list = Array.isArray(data) ? data : [];

      // Detect newly created rows from cross-app events via 3s polling
      if (previousIdsRef.current !== null) {
        const brandNewIds = list
          .filter((p) => !previousIdsRef.current.has(p.id))
          .map((p) => p.id);

        if (brandNewIds.length > 0) {
          setFlashingIds((prev) => new Set([...prev, ...brandNewIds]));
          setTimeout(() => {
            setFlashingIds((prev) => {
              const next = new Set(prev);
              brandNewIds.forEach((id) => next.delete(id));
              return next;
            });
          }, 1600);
        }
      }
      previousIdsRef.current = new Set(list.map((p) => p.id));

      setProjects(list);
      setError(null);
    } catch (err) {
      if (isFirstLoad.current) {
        setError(err.response?.data?.error || err.message || 'Failed to load projects');
      }
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  };

  // Poll every 3 seconds with cleanup function calling clearInterval on unmount
  useEffect(() => {
    fetchProjects();

    const intervalId = setInterval(() => {
      fetchProjects();
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await projectsApi.createProject({
        name: formData.name.trim(),
        description: formData.description,
        budget: Number(formData.budget) || 0,
        status: formData.status,
      });
      setShowCreateModal(false);
      setFormData({ name: '', description: '', budget: '', status: 'planning' });
      setSuccessMessage('Project created successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error creating project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  return (
    <div className="app-view">
      {/* Header */}
      <div className="app-header-row">
        <div className="app-title-group">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h1>Projects Management</h1>
              {/* Live Sync 3s Polling Badge */}
              <div className="live-pulse-badge" title="Auto-refreshing every 3 seconds for live cross-app updates">
                <span className="pulse-dot"></span>
                <span>Live Sync (3s)</span>
              </div>
            </div>
            <p className="app-title-subtitle">Multi-tenant project planning & cross-app pipeline</p>
          </div>
        </div>

        <div className="app-header-actions">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="alert badge-won" style={{ marginBottom: '1.5rem' }}>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Projects Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Origin</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-row-td">
                  Loading projects...
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row-td">
                  No projects found. Mark a CRM Opportunity won or click "New Project".
                </td>
              </tr>
            ) : (
              projects.map((project, idx) => {
                const isAutoCreated = project.metadata?.originEvent === 'OPPORTUNITY_WON';
                const isFlashing = flashingIds.has(project.id);
                return (
                  <tr
                    key={project.id}
                    className={`animate-entrance ${isFlashing ? 'row-flash-highlight' : ''}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{project.name}</strong>
                        {isAutoCreated && (
                          <span className="badge badge-won" style={{ fontSize: '0.6875rem' }}>
                            Auto-Created
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          project.status === 'completed'
                            ? 'badge-won'
                            : project.status === 'active'
                            ? 'badge-proposal'
                            : 'badge-planning'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td>{formatCurrency(project.budget)}</td>
                    <td>
                      {isAutoCreated ? (
                        <span className="badge badge-proposal" style={{ fontSize: '0.6875rem' }}>
                          CRM Won Event
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Direct</span>
                      )}
                    </td>
                    <td>{new Date(project.created_at || Date.now()).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="btn btn-sm btn-outline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Project</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="project-name">Project Name *</label>
                  <input
                    id="project-name"
                    type="text"
                    required
                    placeholder="e.g. Enterprise Cloud Deployment"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="project-budget">Budget ($)</label>
                  <input
                    id="project-budget"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="25000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="project-status">Status</label>
                  <input
                    id="project-status"
                    type="text"
                    placeholder="planning / active / completed"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="project-desc">Description</label>
                  <input
                    id="project-desc"
                    type="text"
                    placeholder="Scope of work and milestones"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedProject && (
        <div className="modal-backdrop" onClick={() => setSelectedProject(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Project Details</h3>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedProject(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Project Name</span>
                  <span className="detail-val">{selectedProject.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Budget</span>
                  <span className="detail-val">{formatCurrency(selectedProject.budget)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-val">
                    <span className="badge badge-planning">{selectedProject.status}</span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Origin Event</span>
                  <span className="detail-val">
                    {selectedProject.metadata?.originEvent ? (
                      <span className="badge badge-won">
                        {selectedProject.metadata.originEvent}
                      </span>
                    ) : (
                      'Manual'
                    )}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Project ID</span>
                  <span className="detail-val"><code>{selectedProject.id}</code></span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact ID</span>
                  <span className="detail-val"><code>{selectedProject.contact_id || 'None'}</code></span>
                </div>
              </div>
              {selectedProject.description && (
                <div className="form-group">
                  <span className="detail-label">Description</span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {selectedProject.description}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedProject(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
