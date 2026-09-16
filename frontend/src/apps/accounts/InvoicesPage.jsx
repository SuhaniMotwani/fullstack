// frontend/src/apps/accounts/InvoicesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import accountsApi from './api';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [flashingIds, setFlashingIds] = useState(new Set());

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    subtotal: '',
    notes: '',
    status: 'draft',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track initial load to prevent flickering on 3s background polls
  const isFirstLoad = useRef(true);
  const previousIdsRef = useRef(null);

  const fetchInvoices = async () => {
    try {
      if (isFirstLoad.current) {
        setLoading(true);
      }
      const data = await accountsApi.listInvoices();
      const list = Array.isArray(data) ? data : [];

      // Detect newly created rows from cross-app events via 3s polling
      if (previousIdsRef.current !== null) {
        const brandNewIds = list
          .filter((inv) => !previousIdsRef.current.has(inv.id))
          .map((inv) => inv.id);

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
      previousIdsRef.current = new Set(list.map((inv) => inv.id));

      setInvoices(list);
      setError(null);
    } catch (err) {
      if (isFirstLoad.current) {
        setError(err.response?.data?.error || err.message || 'Failed to load invoices');
      }
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  };

  // Poll every 3 seconds with cleanup calling clearInterval on unmount
  useEffect(() => {
    fetchInvoices();

    const intervalId = setInterval(() => {
      fetchInvoices();
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const amount = Number(formData.subtotal) || 0;
      await accountsApi.createInvoice({
        invoiceNumber: formData.invoiceNumber.trim() || undefined,
        subtotal: amount,
        totalAmount: amount,
        notes: formData.notes,
        status: formData.status,
      });
      setShowCreateModal(false);
      setFormData({ invoiceNumber: '', subtotal: '', notes: '', status: 'draft' });
      setSuccessMessage('Invoice created successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error creating invoice');
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
              <h1>Accounts & Invoices</h1>
              {/* Live Sync 3s Polling Badge */}
              <div className="live-pulse-badge" title="Auto-refreshing every 3 seconds for live cross-app updates">
                <span className="pulse-dot"></span>
                <span>Live Sync (3s)</span>
              </div>
            </div>
            <p className="app-title-subtitle">Automated invoice generation & financial ledger</p>
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
            <span>New Invoice</span>
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

      {/* Invoices Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Origin Event</th>
              <th>Issue Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-row-td">
                  Loading invoices...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row-td">
                  No invoices found. Invoices are auto-created when an expense is logged on a task.
                </td>
              </tr>
            ) : (
              invoices.map((inv, idx) => {
                const isAutoCreated = inv.metadata?.originEvent === 'EXPENSE_LOGGED';
                const isFlashing = flashingIds.has(inv.id);
                return (
                  <tr
                    key={inv.id}
                    className={`animate-entrance ${isFlashing ? 'row-flash-highlight' : ''}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{inv.invoice_number}</strong>
                        {isAutoCreated && (
                          <span className="badge badge-won" style={{ fontSize: '0.6875rem' }}>
                            Auto-Draft
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          inv.status === 'paid'
                            ? 'badge-paid'
                            : inv.status === 'sent'
                            ? 'badge-proposal'
                            : 'badge-draft'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td>{formatCurrency(inv.total_amount)}</td>
                    <td>
                      {isAutoCreated ? (
                        <span className="badge badge-proposal" style={{ fontSize: '0.6875rem' }}>
                          EXPENSE_LOGGED Event
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Manual</span>
                      )}
                    </td>
                    <td>{inv.issue_date || new Date().toISOString().split('T')[0]}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedInvoice(inv)}
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

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Invoice</h3>
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
                  <label htmlFor="inv-number">Invoice Number (Optional)</label>
                  <input
                    id="inv-number"
                    type="text"
                    placeholder="Leave blank to auto-generate"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inv-subtotal">Amount ($) *</label>
                  <input
                    id="inv-subtotal"
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 1450.00"
                    value={formData.subtotal}
                    onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inv-status">Status</label>
                  <input
                    id="inv-status"
                    type="text"
                    placeholder="draft / sent / paid"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inv-notes">Notes</label>
                  <input
                    id="inv-notes"
                    type="text"
                    placeholder="Memo or payment instructions"
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
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedInvoice && (
        <div className="modal-backdrop" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invoice Breakdown</h3>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedInvoice(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Invoice #</span>
                  <span className="detail-val">{selectedInvoice.invoice_number}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Amount</span>
                  <span className="detail-val">{formatCurrency(selectedInvoice.total_amount)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-val">
                    <span className="badge badge-draft">{selectedInvoice.status}</span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Origin Event</span>
                  <span className="detail-val">
                    {selectedInvoice.metadata?.originEvent ? (
                      <span className="badge badge-won">
                        {selectedInvoice.metadata.originEvent}
                      </span>
                    ) : (
                      'Manual'
                    )}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Invoice ID</span>
                  <span className="detail-val"><code>{selectedInvoice.id}</code></span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact ID</span>
                  <span className="detail-val"><code>{selectedInvoice.contact_id || 'None'}</code></span>
                </div>
              </div>

              {/* Line Items */}
              <div style={{ marginTop: '1.25rem' }}>
                <span className="detail-label">Line Items Breakdown</span>
                {Array.isArray(selectedInvoice.line_items) && selectedInvoice.line_items.length > 0 ? (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedInvoice.line_items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {item.description || 'Logged Item'}
                          </div>
                          {item.taskId && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Task: <code>{item.taskId}</code>
                            </div>
                          )}
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--accent-success-text)' }}>
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                    No separate line items recorded.
                  </p>
                )}
              </div>

              {selectedInvoice.notes && (
                <div style={{ marginTop: '1.25rem' }}>
                  <span className="detail-label">Notes</span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedInvoice(null)}
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
