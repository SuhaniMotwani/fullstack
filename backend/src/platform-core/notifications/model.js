const db = require('../../config/database');

// Table: notifications
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1 AND user_id = $2

const listByUser = async (organizationId, userId, { unreadOnly = false, limit = 50, offset = 0 } = {}) => {
  const params = [organizationId, userId];
  let query = `
    SELECT id, organization_id, user_id, title, message, type, read, read_at, metadata, created_at
    FROM notifications
    WHERE organization_id = $1 AND user_id = $2
  `;

  if (unreadOnly) {
    query += ` AND read = false`;
  }

  params.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $3 OFFSET $4`;

  const result = await db.query(query, params);
  return result.rows;
};

const create = async (organizationId, { userId, title, message, type = 'info', metadata = {} }) => {
  const result = await db.query(
    `INSERT INTO notifications (organization_id, user_id, title, message, type, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, organization_id, user_id, title, message, type, read, read_at, metadata, created_at`,
    [organizationId, userId, title, message, type, JSON.stringify(metadata)]
  );
  return result.rows[0];
};

const markRead = async (organizationId, userId, id) => {
  const result = await db.query(
    `UPDATE notifications
     SET read = true, read_at = NOW()
     WHERE organization_id = $1 AND user_id = $2 AND id = $3
     RETURNING id, read, read_at`,
    [organizationId, userId, id]
  );
  return result.rows[0] || null;
};

const markAllRead = async (organizationId, userId) => {
  const result = await db.query(
    `UPDATE notifications
     SET read = true, read_at = NOW()
     WHERE organization_id = $1 AND user_id = $2 AND read = false
     RETURNING id`,
    [organizationId, userId]
  );
  return { updatedCount: result.rowCount };
};

module.exports = {
  listByUser,
  create,
  markRead,
  markAllRead,
};
