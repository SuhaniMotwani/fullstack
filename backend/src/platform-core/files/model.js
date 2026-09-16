const db = require('../../config/database');

// Table: files_metadata (also accessible via view: files)
// Multi-tenant rule: All queries MUST include WHERE organization_id = $1

const list = async (organizationId, { limit = 50, offset = 0 } = {}) => {
  const result = await db.query(
    `SELECT id, organization_id, uploaded_by, bucket_name, file_path, original_name, mime_type, file_size, metadata, created_at
     FROM files_metadata
     WHERE organization_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [organizationId, limit, offset]
  );
  return result.rows;
};

const getById = async (organizationId, id) => {
  const result = await db.query(
    `SELECT id, organization_id, uploaded_by, bucket_name, file_path, original_name, mime_type, file_size, metadata, created_at
     FROM files_metadata
     WHERE organization_id = $1 AND id = $2
     LIMIT 1`,
    [organizationId, id]
  );
  return result.rows[0] || null;
};

const create = async (organizationId, {
  uploadedBy = null,
  bucketName = 'documents',
  filePath,
  originalName,
  mimeType,
  fileSize,
  metadata = {},
}) => {
  const result = await db.query(
    `INSERT INTO files_metadata (organization_id, uploaded_by, bucket_name, file_path, original_name, mime_type, file_size, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, organization_id, uploaded_by, bucket_name, file_path, original_name, mime_type, file_size, metadata, created_at`,
    [
      organizationId,
      uploadedBy,
      bucketName,
      filePath,
      originalName,
      mimeType,
      fileSize,
      JSON.stringify(metadata),
    ]
  );
  return result.rows[0];
};

const deleteById = async (organizationId, id) => {
  const result = await db.query(
    `DELETE FROM files_metadata
     WHERE organization_id = $1 AND id = $2
     RETURNING id, file_path, bucket_name`,
    [organizationId, id]
  );
  return result.rows[0] || null;
};

module.exports = {
  list,
  getById,
  create,
  deleteById,
};
