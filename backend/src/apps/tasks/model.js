const db = require('../../config/database');

// Table: task_tasks (also accessible via view: tasks)
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1

const list = async (organizationId, { projectId, contactId, status, priority, limit = 50, offset = 0 } = {}) => {
  const params = [organizationId];
  let query = `
    SELECT id, organization_id, project_id, contact_id, assignee_id, title, description, status, priority, due_date, metadata, created_at, updated_at
    FROM task_tasks
    WHERE organization_id = $1
  `;

  if (projectId) {
    params.push(projectId);
    query += ` AND project_id = $${params.length}`;
  }

  if (contactId) {
    params.push(contactId);
    query += ` AND contact_id = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  if (priority) {
    params.push(priority);
    query += ` AND priority = $${params.length}`;
  }

  params.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await db.query(query, params);
  return result.rows;
};

const getById = async (organizationId, id) => {
  const result = await db.query(
    `SELECT id, organization_id, project_id, contact_id, assignee_id, title, description, status, priority, due_date, metadata, created_at, updated_at
     FROM task_tasks
     WHERE organization_id = $1 AND id = $2
     LIMIT 1`,
    [organizationId, id]
  );
  return result.rows[0] || null;
};

const create = async (organizationId, {
  projectId = null,
  contactId = null,
  assigneeId = null,
  title,
  description = null,
  status = 'todo',
  priority = 'medium',
  dueDate = null,
  metadata = {},
}) => {
  const result = await db.query(
    `INSERT INTO task_tasks (organization_id, project_id, contact_id, assignee_id, title, description, status, priority, due_date, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, organization_id, project_id, contact_id, assignee_id, title, description, status, priority, due_date, metadata, created_at, updated_at`,
    [
      organizationId,
      projectId,
      contactId,
      assigneeId,
      title.trim(),
      description,
      status,
      priority,
      dueDate,
      JSON.stringify(metadata),
    ]
  );
  return result.rows[0];
};

const update = async (organizationId, id, data) => {
  const {
    projectId,
    contactId,
    assigneeId,
    title,
    description,
    status,
    priority,
    dueDate,
    metadata,
  } = data;

  const result = await db.query(
    `UPDATE task_tasks
     SET project_id = COALESCE($1, project_id),
         contact_id = COALESCE($2, contact_id),
         assignee_id = COALESCE($3, assignee_id),
         title = COALESCE($4, title),
         description = COALESCE($5, description),
         status = COALESCE($6, status),
         priority = COALESCE($7, priority),
         due_date = COALESCE($8, due_date),
         metadata = COALESCE($9, metadata),
         updated_at = NOW()
     WHERE organization_id = $10 AND id = $11
     RETURNING id, organization_id, project_id, contact_id, assignee_id, title, description, status, priority, due_date, metadata, created_at, updated_at`,
    [
      projectId !== undefined ? projectId : null,
      contactId !== undefined ? contactId : null,
      assigneeId !== undefined ? assigneeId : null,
      title !== undefined ? title.trim() : null,
      description !== undefined ? description : null,
      status !== undefined ? status : null,
      priority !== undefined ? priority : null,
      dueDate !== undefined ? dueDate : null,
      metadata !== undefined ? JSON.stringify(metadata) : null,
      organizationId,
      id,
    ]
  );
  return result.rows[0] || null;
};

const deleteById = async (organizationId, id) => {
  const result = await db.query(
    `DELETE FROM task_tasks
     WHERE organization_id = $1 AND id = $2
     RETURNING id`,
    [organizationId, id]
  );
  return result.rows[0] || null;
};

module.exports = {
  list,
  getById,
  create,
  update,
  deleteById,
};
