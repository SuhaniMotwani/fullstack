const express = require('express');
const router = express.Router();
const userController = require('./controller');
const { authenticate } = require('../auth/middleware');
const { requireRole, requirePermission } = require('../rbac/permission.middleware');
const { ROLES } = require('../rbac/permissions');

router.use(authenticate);

router.get('/', requirePermission('users:read'), userController.getUsers);
router.get('/:id', requirePermission('users:read'), userController.getUser);
router.post('/', requireRole(ROLES.ADMIN, ROLES.MANAGER), userController.createUser);
router.put('/:id', requireRole(ROLES.ADMIN, ROLES.MANAGER), userController.updateUser);
router.delete('/:id', requireRole(ROLES.ADMIN), userController.deleteUser);

module.exports = router;
