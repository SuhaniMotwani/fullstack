const db = require('../../config/database');

// Table: audit_log
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1

const list = async (organizationId, { entityType, entityId, limit = 50, offset = 0 } = {}) => {
  const params = [organizationId];
  let query = `
    SELECT id, organization_id, user_id, action, entity_type, entity_id, details, ip_address, created_at
    FROM audit_log
    WHERE organization_id = $1
  `;

  if (entityType) {
    params.push(entityType);
    query += ` AND entity_type = $${params.length}`;
  }

  if (entityId) {
    params.push(entityId);
    query += ` AND entity_id = $${params.length}`;
  }

  params.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await db.query(query, params);
  return result.rows;
};

const getById = async (organizationId, id) => {
  const result = await db.query(
    `SELECT id, organization_id, user_id, action, entity_type, entity_id, details, ip_address, created_at
     FROM audit_log
     WHERE organization_id = $1 AND id = $2
     LIMIT 1`,
    [organizationId, id]
  );
  return result.rows[0] || null;
};

const create = async (organizationId, { userId = null, action, entityType = null, entityId = null, details = {}, ipAddress = null }) => {
  const result = await db.query(
    `INSERT INTO audit_log (organization_id, user_id, action, entity_type, entity_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, organization_id, user_id, action, entity_type, entity_id, details, ip_address, created_at`,
    [
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      JSON.stringify(details),
      ipAddress,
    ]
  );
  return result.rows[0];
};

module.exports = {
  list,
  getById,
  create,
};
