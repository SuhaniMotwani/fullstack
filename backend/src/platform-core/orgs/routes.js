const express = require('express');
const router = express.Router();
const orgController = require('./controller');
const { authenticate } = require('../auth/middleware');
const { requireRole } = require('../rbac/permission.middleware');
const { ROLES } = require('../rbac/permissions');

router.use(authenticate);

router.get('/current', orgController.getCurrent);
router.put('/current', requireRole(ROLES.ADMIN), orgController.updateCurrent);

module.exports = router;
