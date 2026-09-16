// backend/src/gateway/router.js
// Single mount point: applies auth + entitlement middleware across apps

const express = require('express');
const router = express.Router();

const { authenticate } = require('../platform-core/auth/middleware');
const { requireApp } = require('../platform-core/entitlements/entitlement.middleware');

// Platform Core routes
const authRoutes = require('../platform-core/auth/routes');
const orgRoutes = require('../platform-core/orgs/routes');
const userRoutes = require('../platform-core/users/routes');
const entitlementRoutes = require('../platform-core/entitlements/routes');
const contactRoutes = require('../platform-core/contacts/routes');
const notificationRoutes = require('../platform-core/notifications/routes');
const auditRoutes = require('../platform-core/audit/routes');
const fileRoutes = require('../platform-core/files/routes');

// App routes
const crmRoutes = require('../apps/crm/routes');
const projectsRoutes = require('../apps/projects/routes');
const tasksRoutes = require('../apps/tasks/routes');
const accountsRoutes = require('../apps/accounts/routes');

// Mount Platform Core
router.use('/auth', authRoutes);
router.use('/organizations', orgRoutes);
router.use('/users', userRoutes);
router.use('/entitlements', entitlementRoutes);
router.use('/contacts', contactRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit', auditRoutes);
router.use('/files', fileRoutes);

// Protected app routes with auth + entitlement middleware (under /apps/*)
router.use('/apps/crm', authenticate, requireApp('crm'), crmRoutes);
router.use('/apps/projects', authenticate, requireApp('projects'), projectsRoutes);
router.use('/apps/tasks', authenticate, requireApp('tasks'), tasksRoutes);
router.use('/apps/accounts', authenticate, requireApp('accounts'), accountsRoutes);

module.exports = router;
