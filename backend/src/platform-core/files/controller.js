const fileService = require('./service');

const getFiles = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const files = await fileService.listFiles(req.user.organizationId, {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return res.status(200).json(files);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const getFile = async (req, res, next) => {
  try {
    const file = await fileService.getFileById(req.user.organizationId, req.params.id);
    return res.status(200).json(file);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const uploadFile = async (req, res, next) => {
  try {
    const { originalName, mimeType, fileBase64, metadata } = req.body;

    let fileBuffer;
    if (fileBase64) {
      fileBuffer = Buffer.from(fileBase64, 'base64');
    } else if (Buffer.isBuffer(req.body)) {
      fileBuffer = req.body;
    } else {
      return res.status(400).json({ error: 'fileBase64 or file buffer is required' });
    }

    const fileRecord = await fileService.uploadFile(
      req.user.organizationId,
      req.user.id,
      {
        fileBuffer,
        originalName: originalName || 'untitled-document',
        mimeType: mimeType || 'application/octet-stream',
        fileSize: fileBuffer.length,
        metadata,
      }
    );

    return res.status(201).json(fileRecord);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const result = await fileService.deleteFile(req.user.organizationId, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getFiles,
  getFile,
  uploadFile,
  deleteFile,
};
