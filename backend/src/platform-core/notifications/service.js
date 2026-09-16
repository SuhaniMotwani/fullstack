const notificationModel = require('./model');

const getUserNotifications = async (organizationId, userId, filters) => {
  return await notificationModel.listByUser(organizationId, userId, filters);
};

const sendNotification = async (organizationId, data) => {
  if (!data.userId || !data.title || !data.message) {
    const error = new Error('userId, title, and message are required');
    error.statusCode = 400;
    throw error;
  }
  return await notificationModel.create(organizationId, data);
};

const markNotificationRead = async (organizationId, userId, id) => {
  const updated = await notificationModel.markRead(organizationId, userId, id);
  if (!updated) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

const markAllNotificationsRead = async (organizationId, userId) => {
  return await notificationModel.markAllRead(organizationId, userId);
};

module.exports = {
  getUserNotifications,
  sendNotification,
  markNotificationRead,
  markAllNotificationsRead,
};
