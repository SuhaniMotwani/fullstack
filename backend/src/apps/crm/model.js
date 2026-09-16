const db = require('../../config/database');

// Table: crm_leads
// Table prefix: crm_*
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1 bound to req.user.organizationId

const list = async (organizationId, { stage, contactId, limit = 50, offset = 0 } = {}) => {
  const params = [organizationId];
  let query = `
    SELECT id, organization_id, contact_id, assigned_to, title, stage, status, source, deal_value, estimated_value, currency, notes, metadata, created_at, updated_at
    FROM crm_leads
    WHERE organization_id = $1
  `;

  if (stage) {
    params.push(stage);
    query += ` AND stage = $${params.length}`;
  }

  if (contactId) {
    params.push(contactId);
    query += ` AND contact_id = $${params.length}`;
  }

  params.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await db.query(query, params);
  return result.rows;
};

const getById = async (organizationId, id) => {
  const result = await db.query(
    `SELECT id, organization_id, contact_id, assigned_to, title, stage, status, source, deal_value, estimated_value, currency, notes, metadata, created_at, updated_at
     FROM crm_leads
     WHERE organization_id = $1 AND id = $2
     LIMIT 1`,
    [organizationId, id]
  );
  return result.rows[0] || null;
};

const create = async (organizationId, {
  contactId = null,
  assignedTo = null,
  title,
  stage = 'lead',
  source = null,
  dealValue = 0.00,
  currency = 'USD',
  notes = null,
  metadata = {},
}) => {
  const result = await db.query(
    `INSERT INTO crm_leads (organization_id, contact_id, assigned_to, title, stage, status, source, deal_value, estimated_value, currency, notes, metadata)
     VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $7, $8, $9, $10)
     RETURNING id, organization_id, contact_id, assigned_to, title, stage, status, source, deal_value, estimated_value, currency, notes, metadata, created_at, updated_at`,
    [
      organizationId,
      contactId,
      assignedTo,
      title.trim(),
      stage,
      source ? source.trim() : null,
      dealValue,
      currency,
      notes,
      JSON.stringify(metadata),
    ]
  );
  return result.rows[0];
};

const update = async (organizationId, id, data) => {
  const {
    contactId,
    assignedTo,
    title,
    stage,
    source,
    dealValue,
    currency,
    notes,
    metadata,
  } = data;

  const result = await db.query(
    `UPDATE crm_leads
     SET contact_id = COALESCE($1, contact_id),
         assigned_to = COALESCE($2, assigned_to),
         title = COALESCE($3, title),
         stage = COALESCE($4, stage),
         status = COALESCE($4, status),
         source = COALESCE($5, source),
         deal_value = COALESCE($6, deal_value),
         estimated_value = COALESCE($6, estimated_value),
         currency = COALESCE($7, currency),
         notes = COALESCE($8, notes),
         metadata = COALESCE($9, metadata),
         updated_at = NOW()
     WHERE organization_id = $10 AND id = $11
     RETURNING id, organization_id, contact_id, assigned_to, title, stage, status, source, deal_value, estimated_value, currency, notes, metadata, created_at, updated_at`,
    [
      contactId !== undefined ? contactId : null,
      assignedTo !== undefined ? assignedTo : null,
      title !== undefined ? title.trim() : null,
      stage !== undefined ? stage : null,
      source !== undefined ? source : null,
      dealValue !== undefined ? dealValue : null,
      currency !== undefined ? currency : null,
      notes !== undefined ? notes : null,
      metadata !== undefined ? JSON.stringify(metadata) : null,
      organizationId,
      id,
    ]
  );
  return result.rows[0] || null;
};

const updateStage = async (organizationId, id, stage) => {
  const result = await db.query(
    `UPDATE crm_leads
     SET stage = $1,
         status = $1,
         updated_at = NOW()
     WHERE organization_id = $2 AND id = $3
     RETURNING id, organization_id, contact_id, assigned_to, title, stage, status, source, deal_value, estimated_value, currency, notes, metadata, created_at, updated_at`,
    [stage, organizationId, id]
  );
  return result.rows[0] || null;
};

const deleteById = async (organizationId, id) => {
  const result = await db.query(
    `DELETE FROM crm_leads
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
  updateStage,
  deleteById,
};
