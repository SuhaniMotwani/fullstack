const express = require('express');
const router = express.Router();
const contactController = require('./controller');
const { authenticate } = require('../auth/middleware');
const { requirePermission } = require('../rbac/permission.middleware');

router.use(authenticate);

router.get('/', requirePermission('contacts:read'), contactController.getContacts);
router.get('/:id', requirePermission('contacts:read'), contactController.getContact);
router.post('/', requirePermission('contacts:write'), contactController.createContact);
router.put('/:id', requirePermission('contacts:write'), contactController.updateContact);
router.delete('/:id', requirePermission('contacts:write'), contactController.deleteContact);

module.exports = router;
