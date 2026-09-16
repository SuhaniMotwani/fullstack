const notificationService = require('./service');

const getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, limit, offset } = req.query;
    const notifications = await notificationService.getUserNotifications(
      req.user.organizationId,
      req.user.id,
      {
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      }
    );
    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.sendNotification(req.user.organizationId, req.body);
    return res.status(201).json(notification);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const markRead = async (req, res, next) => {
  try {
    const updated = await notificationService.markNotificationRead(
      req.user.organizationId,
      req.user.id,
      req.params.id
    );
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllNotificationsRead(
      req.user.organizationId,
      req.user.id
    );
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markRead,
  markAllRead,
};
