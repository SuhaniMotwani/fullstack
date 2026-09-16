const db = require('../../config/database');

// Table: entitlements
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1

const findByOrg = async (organizationId) => {
  const result = await db.query(
    `SELECT id, organization_id, app_slug, enabled, settings, created_at, updated_at
     FROM entitlements
     WHERE organization_id = $1
     ORDER BY app_slug ASC`,
    [organizationId]
  );
  return result.rows;
};

const findByOrgAndApp = async (organizationId, appSlug) => {
  const result = await db.query(
    `SELECT id, organization_id, app_slug, enabled, settings, created_at, updated_at
     FROM entitlements
     WHERE organization_id = $1 AND app_slug = $2
     LIMIT 1`,
    [organizationId, appSlug.toLowerCase().trim()]
  );
  return result.rows[0] || null;
};

const upsert = async (organizationId, appSlug, enabled = true, settings = {}) => {
  const result = await db.query(
    `INSERT INTO entitlements (organization_id, app_slug, enabled, settings)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (organization_id, app_slug)
     DO UPDATE SET enabled = EXCLUDED.enabled,
                   settings = EXCLUDED.settings,
                   updated_at = NOW()
     RETURNING id, organization_id, app_slug, enabled, settings, created_at, updated_at`,
    [organizationId, appSlug.toLowerCase().trim(), enabled, JSON.stringify(settings)]
  );
  return result.rows[0];
};

const deleteByOrgAndApp = async (organizationId, appSlug) => {
  const result = await db.query(
    `DELETE FROM entitlements
     WHERE organization_id = $1 AND app_slug = $2
     RETURNING id`,
    [organizationId, appSlug.toLowerCase().trim()]
  );
  return result.rows[0] || null;
};

module.exports = {
  findByOrg,
  findByOrgAndApp,
  upsert,
  deleteByOrgAndApp,
};
