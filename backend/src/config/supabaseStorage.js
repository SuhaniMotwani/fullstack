const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'placeholder-service-role-key';
const BUCKET_NAME = 'documents';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const uploadDocument = async (filePath, fileBuffer, contentType = 'application/octet-stream') => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage upload error: ${error.message}`);
  }

  return data;
};

const downloadDocument = async (filePath) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error) {
    throw new Error(`Supabase Storage download error: ${error.message}`);
  }

  return data;
};

const removeDocument = async (filePath) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`Supabase Storage remove error: ${error.message}`);
  }

  return data;
};

const createSignedUrl = async (filePath, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Supabase Storage signed URL error: ${error.message}`);
  }

  return data.signedUrl;
};

const listDocuments = async (prefix = '') => {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(prefix);

  if (error) {
    throw new Error(`Supabase Storage list error: ${error.message}`);
  }

  return data;
};

module.exports = {
  supabase,
  BUCKET_NAME,
  uploadDocument,
  downloadDocument,
  removeDocument,
  createSignedUrl,
  listDocuments,
};
