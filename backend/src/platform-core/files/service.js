const fileModel = require('./model');
const { uploadDocument, removeDocument, createSignedUrl, downloadDocument } = require('../../config/supabaseStorage');

const listFiles = async (organizationId, options) => {
  return await fileModel.list(organizationId, options);
};

const getFileById = async (organizationId, id) => {
  const file = await fileModel.getById(organizationId, id);
  if (!file) {
    const error = new Error('File not found');
    error.statusCode = 404;
    throw error;
  }

  // Generate signed URL for access
  let signedUrl = null;
  try {
    signedUrl = await createSignedUrl(file.file_path, 3600);
  } catch (err) {
    // If Supabase Storage key is not configured in local environment, gracefully continue
  }

  return {
    ...file,
    downloadUrl: signedUrl,
  };
};

const uploadFile = async (organizationId, userId, { fileBuffer, originalName, mimeType = 'application/octet-stream', fileSize = 0, metadata = {} }) => {
  if (!fileBuffer || !originalName) {
    const error = new Error('File buffer and original name are required');
    error.statusCode = 400;
    throw error;
  }

  const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${organizationId}/${Date.now()}-${sanitizedName}`;

  // Upload to Supabase Storage "documents" bucket
  await uploadDocument(storagePath, fileBuffer, mimeType);

  // Record in database keyed to organization_id
  const fileRecord = await fileModel.create(organizationId, {
    uploadedBy: userId,
    bucketName: 'documents',
    filePath: storagePath,
    originalName,
    mimeType,
    fileSize: fileSize || fileBuffer.length || 0,
    metadata,
  });

  return fileRecord;
};

const deleteFile = async (organizationId, id) => {
  const file = await fileModel.getById(organizationId, id);
  if (!file) {
    const error = new Error('File not found');
    error.statusCode = 404;
    throw error;
  }

  // Remove from Supabase Storage
  try {
    await removeDocument(file.file_path);
  } catch (err) {
    // Continue with database deletion
  }

  await fileModel.deleteById(organizationId, id);
  return { message: 'File deleted successfully', id };
};

module.exports = {
  listFiles,
  getFileById,
  uploadFile,
  deleteFile,
};
