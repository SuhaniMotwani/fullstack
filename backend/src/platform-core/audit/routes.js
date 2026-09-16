const express = require('express');
const router = express.Router();
const auditController = require('./controller');
const { authenticate } = require('../auth/middleware');
const { requireRole } = require('../rbac/permission.middleware');
const { ROLES } = require('../rbac/permissions');

router.use(authenticate);
router.use(requireRole(ROLES.ADMIN));

router.get('/', auditController.getAuditLogs);
router.get('/:id', auditController.getAuditLog);

module.exports = router;
