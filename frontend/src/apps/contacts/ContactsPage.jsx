// frontend/src/apps/contacts/ContactsPage.jsx
import React, { useState, useEffect } from 'react';
import contactsApi from './api';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contactsApi.listContacts();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCopyId = async (id, name) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        // Fallback for non-secure or older contexts
        const textarea = document.createElement('textarea');
        textarea.value = id;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(id);
      setSuccessMessage(`📋 Copied Contact ID for "${name || 'Contact'}" to clipboard!`);
      setTimeout(() => setCopiedId(null), 2500);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert('Failed to copy ID to clipboard: ' + err.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      alert('First name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await contactsApi.createContact({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        jobTitle: formData.jobTitle.trim() || undefined,
      });

      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
      });
      setSuccessMessage('Contact created successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchContacts();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error creating contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (contact) => {
    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'this contact';
    if (!window.confirm(`Are you sure you want to delete ${fullName}?`)) return;

    setIsDeleting(true);
    try {
      await contactsApi.deleteContact(contact.id);
      setSuccessMessage(`Contact "${fullName}" deleted.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      if (selectedContact?.id === contact.id) {
        setSelectedContact(null);
      }
      await fetchContacts();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to delete contact');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-view">
      {/* Header Row */}
      <div className="app-header-row">
        <div className="app-title-group">
          <div>
            <h1>Contacts Directory</h1>
            <p className="app-title-subtitle">
              Platform-wide unified contact directory & cross-app linking
            </p>
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
            <span>New Contact</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Contacts Data Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Contact ID (Copy)</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-row-td">
                  Loading contacts directory...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row-td">
                  No contacts found. Click "New Contact" to create one.
                </td>
              </tr>
            ) : (
              contacts.map((contact, idx) => {
                const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact';
                const isCopied = copiedId === contact.id;

                return (
                  <tr
                    key={contact.id}
                    className="animate-entrance"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <td>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                          {fullName}
                        </strong>
                        {contact.job_title && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {contact.job_title}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Copyable Contact ID */}
                    <td>
                      <button
                        onClick={() => handleCopyId(contact.id, fullName)}
                        className="btn btn-sm btn-outline"
                        title="Click to copy Contact UUID to clipboard"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.28rem 0.65rem',
                          fontFamily: 'ui-monospace, monospace',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {isCopied ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span style={{ color: '#059669', fontWeight: 700 }}>Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            <span>{contact.id.slice(0, 8)}...</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td>{contact.email || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{contact.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>

                    <td>
                      {contact.company ? (
                        <span className="badge badge-proposal">
                          {contact.company}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="btn btn-sm btn-outline"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleDelete(contact)}
                          disabled={isDeleting}
                          className="btn btn-sm btn-ghost"
                          title="Delete Contact"
                          style={{ color: 'var(--accent-danger-text)' }}
                        >
                          Delete
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

      {/* Create Contact Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Contact</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowCreateModal(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="jane.doe@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="text"
                    placeholder="+1 (555) 234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="company">Company</label>
                    <input
                      id="company"
                      type="text"
                      placeholder="Acme Corp"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="jobTitle">Job Title</label>
                    <input
                      id="jobTitle"
                      type="text"
                      placeholder="Chief Technology Officer"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Creating...' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="modal-backdrop" onClick={() => setSelectedContact(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contact Details</h3>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedContact(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-val">
                    {`${selectedContact.first_name || ''} ${selectedContact.last_name || ''}`.trim() || '—'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Company</span>
                  <span className="detail-val">{selectedContact.company || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Job Title</span>
                  <span className="detail-val">{selectedContact.job_title || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-val">{selectedContact.email || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone</span>
                  <span className="detail-val">{selectedContact.phone || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created</span>
                  <span className="detail-val">
                    {new Date(selectedContact.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="detail-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                  Contact UUID (Cross-App Reference)
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <code style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>{selectedContact.id}</code>
                  <button
                    onClick={() => handleCopyId(selectedContact.id, selectedContact.first_name)}
                    className="btn btn-sm btn-primary"
                    style={{ flexShrink: 0 }}
                  >
                    Copy UUID
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="btn btn-outline"
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
