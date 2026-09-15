// backend/src/gateway/router.js
// Single mount point: applies auth + entitlement middleware across apps

const express = require('express');
const router = express.Router();

const { authenticate } = require('../platform-core/auth/middleware');
const { requireEntitlement } = require('../platform-core/entitlements/entitlementMiddleware');

// Platform Core routes
const authRoutes = require('../platform-core/auth/routes');
const orgRoutes = require('../platform-core/orgs/routes');
const userRoutes = require('../platform-core/users/routes');

// App routes
const crmRoutes = require('../apps/crm/routes');
const projectsRoutes = require('../apps/projects/routes');
const tasksRoutes = require('../apps/tasks/routes');
const accountsRoutes = require('../apps/accounts/routes');

// Mount Platform Core
router.use('/auth', authRoutes);
router.use('/organizations', orgRoutes);
router.use('/users', userRoutes);

// Protected app routes with auth + entitlement middleware
router.use('/crm', authenticate, requireEntitlement('crm'), crmRoutes);
router.use('/projects', authenticate, requireEntitlement('projects'), projectsRoutes);
router.use('/tasks', authenticate, requireEntitlement('tasks'), tasksRoutes);
router.use('/accounts', authenticate, requireEntitlement('accounts'), accountsRoutes);

module.exports = router;

