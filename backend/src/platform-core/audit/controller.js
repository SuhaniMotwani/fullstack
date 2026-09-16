const auditService = require('./service');

const getAuditLogs = async (req, res, next) => {
  try {
    const { entityType, entityId, limit, offset } = req.query;
    const logs = await auditService.getAuditLogs(req.user.organizationId, {
      entityType,
      entityId,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return res.status(200).json(logs);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const getAuditLog = async (req, res, next) => {
  try {
    const log = await auditService.getAuditLogById(req.user.organizationId, req.params.id);
    return res.status(200).json(log);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLog,
};
