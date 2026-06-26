const seedNotifications = require("../data/notifications");

let notifications = [...seedNotifications];

function cloneNotification(notification) {
  return { ...notification };
}

function listNotifications({ notificationType, page, limit }) {
  let filtered = [...notifications].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  if (notificationType && notificationType !== "All") {
    filtered = filtered.filter((notification) => notification.type === notificationType);
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 5);
  const totalPages = Math.max(1, Math.ceil(filtered.length / safeLimit));
  const start = (safePage - 1) * safeLimit;
  const pagedNotifications = filtered.slice(start, start + safeLimit).map(cloneNotification);

  return {
    notifications: pagedNotifications,
    page: safePage,
    limit: safeLimit,
    totalPages,
    totalCount: filtered.length,
  };
}

function createNotification(notificationInput) {
  const timestamp = new Date().toISOString();
  const notification = {
    id: `notif_${Date.now()}`,
    title: notificationInput.title,
    message: notificationInput.message,
    type: notificationInput.type,
    userId: notificationInput.userId || "user_456",
    isRead: false,
    timestamp,
    createdAt: timestamp,
  };

  notifications = [notification, ...notifications];
  return cloneNotification(notification);
}

function markNotificationAsRead(notificationId) {
  let updatedNotification = null;

  notifications = notifications.map((notification) => {
    if (notification.id !== notificationId) {
      return notification;
    }

    updatedNotification = { ...notification, isRead: true };
    return updatedNotification;
  });

  return updatedNotification ? cloneNotification(updatedNotification) : null;
}

function deleteNotification(notificationId) {
  const initialLength = notifications.length;
  notifications = notifications.filter((notification) => notification.id !== notificationId);
  return notifications.length !== initialLength;
}

function getNotification(notificationId) {
  const notification = notifications.find((item) => item.id === notificationId);
  return notification ? cloneNotification(notification) : null;
}

module.exports = {
  listNotifications,
  createNotification,
  markNotificationAsRead,
  deleteNotification,
  getNotification,
};