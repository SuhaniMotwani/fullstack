const db = require('../../config/database');

// Table: contacts
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1
// Soft-delete rule: Default queries MUST filter by deleted_at IS NULL to preserve FK references

const list = async (organizationId, { search, limit = 50, offset = 0, includeDeleted = false } = {}) => {
  const params = [organizationId, includeDeleted];
  let query = `
    SELECT id, organization_id, first_name, last_name, email, phone, company, job_title, address, metadata, created_at, updated_at, deleted_at
    FROM contacts
    WHERE organization_id = $1
      AND (deleted_at IS NULL OR $2 = true)
  `;

  if (search && search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    const searchIdx = params.length;
    query += `
      AND (
        LOWER(first_name) LIKE $${searchIdx} OR
        LOWER(last_name) LIKE $${searchIdx} OR
        LOWER(email) LIKE $${searchIdx} OR
        LOWER(company) LIKE $${searchIdx}
      )
    `;
  }

  params.push(limit, offset);
  query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await db.query(query, params);
  return result.rows;
};

const getById = async (organizationId, id, includeDeleted = false) => {
  const result = await db.query(
    `SELECT id, organization_id, first_name, last_name, email, phone, company, job_title, address, metadata, created_at, updated_at, deleted_at
     FROM contacts
     WHERE organization_id = $1 AND id = $2
       AND (deleted_at IS NULL OR $3 = true)
     LIMIT 1`,
    [organizationId, id, includeDeleted]
  );
  return result.rows[0] || null;
};

const create = async (organizationId, data) => {
  const {
    firstName,
    lastName = null,
    email = null,
    phone = null,
    company = null,
    jobTitle = null,
    address = {},
    metadata = {},
  } = data;

  const result = await db.query(
    `INSERT INTO contacts (organization_id, first_name, last_name, email, phone, company, job_title, address, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, organization_id, first_name, last_name, email, phone, company, job_title, address, metadata, created_at, updated_at, deleted_at`,
    [
      organizationId,
      firstName.trim(),
      lastName ? lastName.trim() : null,
      email ? email.toLowerCase().trim() : null,
      phone ? phone.trim() : null,
      company ? company.trim() : null,
      jobTitle ? jobTitle.trim() : null,
      JSON.stringify(address),
      JSON.stringify(metadata),
    ]
  );
  return result.rows[0];
};

const update = async (organizationId, id, data) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    company,
    jobTitle,
    address,
    metadata,
  } = data;

  const result = await db.query(
    `UPDATE contacts
     SET first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         company = COALESCE($5, company),
         job_title = COALESCE($6, job_title),
         address = COALESCE($7, address),
         metadata = COALESCE($8, metadata),
         updated_at = NOW()
     WHERE organization_id = $9 AND id = $10 AND deleted_at IS NULL
     RETURNING id, organization_id, first_name, last_name, email, phone, company, job_title, address, metadata, created_at, updated_at, deleted_at`,
    [
      firstName !== undefined ? firstName.trim() : null,
      lastName !== undefined ? lastName.trim() : null,
      email !== undefined ? email.toLowerCase().trim() : null,
      phone !== undefined ? phone.trim() : null,
      company !== undefined ? company.trim() : null,
      jobTitle !== undefined ? jobTitle.trim() : null,
      address !== undefined ? JSON.stringify(address) : null,
      metadata !== undefined ? JSON.stringify(metadata) : null,
      organizationId,
      id,
    ]
  );
  return result.rows[0] || null;
};

// Soft delete: sets deleted_at = NOW() to preserve foreign keys from crm_leads, projects, invoices
const softDelete = async (organizationId, id) => {
  const result = await db.query(
    `UPDATE contacts
     SET deleted_at = NOW(),
         updated_at = NOW()
     WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL
     RETURNING id, deleted_at`,
    [organizationId, id]
  );
  return result.rows[0] || null;
};

module.exports = {
  list,
  getById,
  create,
  update,
  softDelete,
};
