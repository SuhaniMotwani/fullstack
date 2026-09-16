// frontend/src/apps/tasks/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import tasksApi from './api';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [expenseTask, setExpenseTask] = useState(null);

  // Create Task Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expense Form State
  const [expenseData, setExpenseData] = useState({
    amount: '',
    description: '',
  });
  const [isLoggingExpense, setIsLoggingExpense] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.listTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await tasksApi.createTask({
        title: formData.title.trim(),
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
      });
      setShowCreateModal(false);
      setFormData({ title: '', description: '', priority: 'medium', status: 'todo' });
      setSuccessMessage('Task created successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error creating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseTask || !expenseData.amount) return;

    setIsLoggingExpense(true);
    try {
      await tasksApi.logExpense(expenseTask.id, {
        amount: Number(expenseData.amount),
        description: expenseData.description,
        contactId: expenseTask.contact_id || null,
      });

      setSuccessMessage(
        `💸 Expense of $${Number(expenseData.amount).toFixed(2)} logged! Event EXPENSE_LOGGED dispatched to Accounts app.`
      );
      setTimeout(() => setSuccessMessage(''), 6000);
      setExpenseTask(null);
      setExpenseData({ amount: '', description: '' });
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error logging expense');
    } finally {
      setIsLoggingExpense(false);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'badge-priority-high';
      case 'medium':
        return 'badge-priority-medium';
      default:
        return 'badge-priority-low';
    }
  };

  return (
    <div className="app-view">
      {/* Header */}
      <div className="app-header-row">
        <div className="app-title-group">
          <div>
            <h1>Tasks Operations</h1>
            <p className="app-title-subtitle">Workflow tracking, task assignment & expense logging</p>
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
            <span>New Task</span>
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

      {/* Tasks Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Origin</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-row-td">
                  Loading tasks...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row-td">
                  No tasks found. Tasks are automatically generated when a Project is created.
                </td>
              </tr>
            ) : (
              tasks.map((task, idx) => {
                const isAutoGenerated =
                  task.metadata?.generatedBy === 'PROJECT_CREATED_EVENT' ||
                  task.metadata?.originEvent === 'PROJECT_CREATED';
                return (
                  <tr
                    key={task.id}
                    className="animate-entrance"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{task.title}</strong>
                        {isAutoGenerated && (
                          <span className="badge badge-won" style={{ fontSize: '0.6875rem' }}>
                            Auto-Generated
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityClass(task.priority)}`}>
                        {task.priority || 'medium'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-planning">
                        {task.status || 'todo'}
                      </span>
                    </td>
                    <td>
                      {isAutoGenerated ? (
                        <span className="badge badge-proposal" style={{ fontSize: '0.6875rem' }}>
                          Project Starter Task
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Manual</span>
                      )}
                    </td>
                    <td>{new Date(task.created_at || Date.now()).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setExpenseTask(task)}
                          className="btn btn-sm btn-primary"
                          title="Log expense against this task to trigger draft invoice generation"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          <span>Log Expense</span>
                        </button>
                        <button
                          onClick={() => setSelectedTask(task)}
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

      {/* Log Expense Dialog */}
      {expenseTask && (
        <div className="modal-backdrop" onClick={() => setExpenseTask(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log Expense on Task</h3>
              <button className="modal-close-btn" onClick={() => setExpenseTask(null)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit}>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  Logging an expense publishes <code>EXPENSE_LOGGED</code> across the event bus and automatically provisions a draft invoice in the Accounts app.
                </p>

                <div className="detail-grid" style={{ marginBottom: '1rem' }}>
                  <div className="detail-item">
                    <span className="detail-label">Task</span>
                    <span className="detail-val">{expenseTask.title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Task ID</span>
                    <span className="detail-val"><code>{expenseTask.id}</code></span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="expense-amount">Expense Amount ($) *</label>
                  <input
                    id="expense-amount"
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 1450.00"
                    value={expenseData.amount}
                    onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expense-desc">Description</label>
                  <input
                    id="expense-desc"
                    type="text"
                    placeholder="e.g. Architectural blueprint drafting and materials"
                    value={expenseData.description}
                    onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setExpenseTask(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isLoggingExpense}
                >
                  {isLoggingExpense ? 'Logging & Dispatching...' : 'Log Expense & Auto-Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Task</h3>
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
                  <label htmlFor="task-title">Task Title *</label>
                  <input
                    id="task-title"
                    type="text"
                    required
                    placeholder="e.g. Milestone 1 Architecture Review"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-priority">Priority</label>
                  <input
                    id="task-priority"
                    type="text"
                    placeholder="high / medium / low"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-desc">Description</label>
                  <input
                    id="task-desc"
                    type="text"
                    placeholder="Actionable steps and checklist items"
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
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedTask && (
        <div className="modal-backdrop" onClick={() => setSelectedTask(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Task Details</h3>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedTask(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Task Title</span>
                  <span className="detail-val">{selectedTask.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Priority</span>
                  <span className="detail-val">
                    <span className={`badge ${getPriorityClass(selectedTask.priority)}`}>
                      {selectedTask.priority || 'medium'}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-val">
                    <span className="badge badge-planning">{selectedTask.status || 'todo'}</span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Origin</span>
                  <span className="detail-val">
                    {selectedTask.metadata?.generatedBy || 'Manual'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Task ID</span>
                  <span className="detail-val"><code>{selectedTask.id}</code></span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Project ID</span>
                  <span className="detail-val"><code>{selectedTask.project_id || 'None'}</code></span>
                </div>
              </div>
              {selectedTask.description && (
                <div className="form-group">
                  <span className="detail-label">Description</span>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {selectedTask.description}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedTask(null)}
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
