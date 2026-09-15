const db = require('../../config/database');

const getOrganizationById = async (organizationId) => {
  const result = await db.query(
    `SELECT id, name, slug, created_at, updated_at
     FROM organizations
     WHERE id = $1
     LIMIT 1`,
    [organizationId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Organization not found');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

const updateOrganization = async (organizationId, { name }) => {
  if (!name || !name.trim()) {
    const error = new Error('Organization name is required');
    error.statusCode = 400;
    throw error;
  }

  const result = await db.query(
    `UPDATE organizations
     SET name = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, slug, created_at, updated_at`,
    [name.trim(), organizationId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Organization not found');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

module.exports = {
  getOrganizationById,
  updateOrganization,
};
