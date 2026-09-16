const express = require('express');
const router = express.Router();
const entitlementController = require('./controller');
const { authenticate } = require('../auth/middleware');
const { requireRole } = require('../rbac/permission.middleware');
const { ROLES } = require('../rbac/permissions');

router.use(authenticate);

router.get('/', entitlementController.getEntitlements);
router.put('/:appCode', requireRole(ROLES.ADMIN), entitlementController.updateEntitlement);

module.exports = router;
