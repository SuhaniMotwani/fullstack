// frontend/src/apps/crm/LeadsPage.jsx
import React, { useState, useEffect } from 'react';
import crmApi from './api';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    dealValue: '',
    source: 'Referral',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await crmApi.listLeads();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await crmApi.createLead({
        title: formData.title.trim(),
        dealValue: Number(formData.dealValue) || 0,
        source: formData.source,
        notes: formData.notes,
        stage: 'lead',
      });
      setShowCreateModal(false);
      setFormData({ title: '', dealValue: '', source: 'Referral', notes: '' });
      setSuccessMessage('Lead created successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchLeads();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error creating lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkWon = async (lead) => {
    setActionInProgress(lead.id);
    try {
      await crmApi.markWon(lead.id);
      setSuccessMessage(
        `🎉 Opportunity "${lead.title}" marked as WON! Event OPPORTUNITY_WON dispatched to Projects app.`
      );
      setTimeout(() => setSuccessMessage(''), 6000);
      await fetchLeads();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to mark lead won');
    } finally {
      setActionInProgress(null);
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
            <h1>CRM Opportunities</h1>
            <p className="app-title-subtitle">Pipeline stage progression & deal automation</p>
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
            <span>New Lead</span>
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

      {/* Data Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead Title</th>
              <th>Deal Value</th>
              <th>Stage</th>
              <th>Source</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-row-td">
                  Loading CRM opportunities...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row-td">
                  No leads found. Click "New Lead" to create one.
                </td>
              </tr>
            ) : (
              leads.map((lead, idx) => {
                const isWon = lead.stage === 'won';
                return (
                  <tr
                    key={lead.id}
                    className="animate-entrance"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{lead.title}</strong>
                    </td>
                    <td>{formatCurrency(lead.deal_value || lead.dealValue)}</td>
                    <td>
                      <span
                        className={`badge ${
                          isWon
                            ? 'badge-won'
                            : lead.stage === 'proposal'
                            ? 'badge-proposal'
                            : 'badge-lead'
                        }`}
                      >
                        {lead.stage}
                      </span>
                    </td>
                    <td>{lead.source || 'Direct'}</td>
                    <td>{new Date(lead.created_at || Date.now()).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {!isWon && (
                          <button
                            onClick={() => handleMarkWon(lead)}
                            disabled={actionInProgress === lead.id}
                            className="btn btn-sm btn-primary"
                            title="Mark Won & Trigger Cross-App Project Creation"
                          >
                            {actionInProgress === lead.id ? (
                              'Marking...'
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Mark Won</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="btn btn-sm btn-outline"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Lead Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create CRM Opportunity</h3>
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
                  <label htmlFor="lead-title">Opportunity Title *</label>
                  <input
                    id="lead-title"
                    type="text"
                    required
                    placeholder="e.g. Cloud Modernization Contract"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="deal-value">Deal Value ($)</label>
                  <input
                    id="deal-value"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="50000"
                    value={formData.dealValue}
                    onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lead-source">Lead Source</label>
                  <input
                    id="lead-source"
                    type="text"
                    placeholder="Referral / Direct / Partner"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lead-notes">Notes</label>
                  <input
                    id="lead-notes"
                    type="text"
                    placeholder="Key project scope notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {isSubmitting ? 'Creating...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedLead && (
        <div className="modal-backdrop" onClick={() => setSelectedLead(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Lead Details</h3>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedLead(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Lead Title</span>
                  <span className="detail-val">{selectedLead.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Deal Value</span>
                  <span className="detail-val">{formatCurrency(selectedLead.deal_value || selectedLead.dealValue)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Stage</span>
                  <span className="detail-val">
                    <span
                      className={`badge ${
                        selectedLead.stage === 'won'
                          ? 'badge-won'
                          : selectedLead.stage === 'proposal'
                          ? 'badge-proposal'
                          : 'badge-lead'
                      }`}
                    >
                      {selectedLead.stage}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Source</span>
                  <span className="detail-val">{selectedLead.source || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Lead ID</span>
                  <span className="detail-val"><code>{selectedLead.id}</code></span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact ID</span>
                  <span className="detail-val"><code>{selectedLead.contact_id || 'None'}</code></span>
                </div>
              </div>
              {selectedLead.notes && (
                <div className="form-group">
                  <span className="detail-label">Notes</span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {selectedLead.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedLead.stage !== 'won' && (
                <button
                  onClick={() => {
                    handleMarkWon(selectedLead);
                    setSelectedLead(null);
                  }}
                  className="btn btn-success"
                >
                  Mark Won Now
                </button>
              )}
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedLead(null)}
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
