const db = require('../../config/database');

// Table: proj_projects (also accessible via view: projects)
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1

const list = async (organizationId, { contactId, status, limit = 50, offset = 0 } = {}) => {
  const params = [organizationId];
  let query = `
    SELECT id, organization_id, contact_id, owner_id, name, description, status, start_date, due_date, budget, currency, metadata, created_at, updated_at
    FROM proj_projects
    WHERE organization_id = $1
  `;

  if (contactId) {
    params.push(contactId);
    query += ` AND contact_id = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  params.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await db.query(query, params);
  return result.rows;
};

const getById = async (organizationId, id) => {
  const result = await db.query(
    `SELECT id, organization_id, contact_id, owner_id, name, description, status, start_date, due_date, budget, currency, metadata, created_at, updated_at
     FROM proj_projects
     WHERE organization_id = $1 AND id = $2
     LIMIT 1`,
    [organizationId, id]
  );
  return result.rows[0] || null;
};

const create = async (organizationId, {
  contactId = null,
  ownerId = null,
  name,
  description = null,
  status = 'planning',
  startDate = null,
  dueDate = null,
  budget = 0.00,
  currency = 'USD',
  metadata = {},
}) => {
  const result = await db.query(
    `INSERT INTO proj_projects (organization_id, contact_id, owner_id, name, description, status, start_date, due_date, budget, currency, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, organization_id, contact_id, owner_id, name, description, status, start_date, due_date, budget, currency, metadata, created_at, updated_at`,
    [
      organizationId,
      contactId,
      ownerId,
      name.trim(),
      description,
      status,
      startDate,
      dueDate,
      budget,
      currency,
      JSON.stringify(metadata),
    ]
  );
  return result.rows[0];
};

const update = async (organizationId, id, data) => {
  const {
    contactId,
    ownerId,
    name,
    description,
    status,
    startDate,
    dueDate,
    budget,
    currency,
    metadata,
  } = data;

  const result = await db.query(
    `UPDATE proj_projects
     SET contact_id = COALESCE($1, contact_id),
         owner_id = COALESCE($2, owner_id),
         name = COALESCE($3, name),
         description = COALESCE($4, description),
         status = COALESCE($5, status),
         start_date = COALESCE($6, start_date),
         due_date = COALESCE($7, due_date),
         budget = COALESCE($8, budget),
         currency = COALESCE($9, currency),
         metadata = COALESCE($10, metadata),
         updated_at = NOW()
     WHERE organization_id = $11 AND id = $12
     RETURNING id, organization_id, contact_id, owner_id, name, description, status, start_date, due_date, budget, currency, metadata, created_at, updated_at`,
    [
      contactId !== undefined ? contactId : null,
      ownerId !== undefined ? ownerId : null,
      name !== undefined ? name.trim() : null,
      description !== undefined ? description : null,
      status !== undefined ? status : null,
      startDate !== undefined ? startDate : null,
      dueDate !== undefined ? dueDate : null,
      budget !== undefined ? budget : null,
      currency !== undefined ? currency : null,
      metadata !== undefined ? JSON.stringify(metadata) : null,
      organizationId,
      id,
    ]
  );
  return result.rows[0] || null;
};

const deleteById = async (organizationId, id) => {
  const result = await db.query(
    `DELETE FROM proj_projects
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
