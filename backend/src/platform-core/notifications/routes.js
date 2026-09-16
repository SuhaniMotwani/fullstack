const express = require('express');
const router = express.Router();
const notificationController = require('./controller');
const { authenticate } = require('../auth/middleware');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.patch('/:id/read', notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

module.exports = router;
