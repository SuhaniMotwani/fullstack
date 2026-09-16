const auditModel = require('./model');

const getAuditLogs = async (organizationId, filters) => {
  return await auditModel.list(organizationId, filters);
};

const getAuditLogById = async (organizationId, id) => {
  const log = await auditModel.getById(organizationId, id);
  if (!log) {
    const error = new Error('Audit log entry not found');
    error.statusCode = 404;
    throw error;
  }
  return log;
};

const recordAuditLog = async (organizationId, data) => {
  if (!data.action) {
    const error = new Error('Action is required for audit log');
    error.statusCode = 400;
    throw error;
  }
  return await auditModel.create(organizationId, data);
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  recordAuditLog,
};
