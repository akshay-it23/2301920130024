import { useEffect, useState } from "react";
import { fetchNotifications } from "../api/notifications";
import { logEvent } from "../utils/logger";

export function useNotifications(filter = "All", page = 1, limit = 5) {
  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      logEvent("useNotifications", "info", "notification-app-fe", "Fetching notifications");
      setLoading(true);
      setError("");

      try {
        const data = await fetchNotifications(filter, page, limit);

        if (!isActive) {
          return;
        }

        const fetchedNotifications = data.notifications ?? [];
        setNotifications(fetchedNotifications);
        setTotalPages(data.totalPages ?? 1);
        
        logEvent(
          "useNotifications",
          "info",
          "notification-app-fe",
          `Successfully fetched ${fetchedNotifications.length} notifications`,
        );
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        const message = requestError instanceof Error ? requestError.message : "An error occurred";
        setNotifications([]);
        setError(message);
        logEvent("useNotifications", "error", "notification-app-fe", `API failure: ${message}`);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [filter, page, limit]);

  const createNotification = (notificationInput) => {
    const nextNotification = {
      id: Date.now(),
      title: notificationInput.title,
      message: notificationInput.message,
      type: notificationInput.type,
      isRead: false,
      timestamp: new Date().toISOString(),
    };

    setNotifications((currentNotifications) => [nextNotification, ...currentNotifications]);
    logEvent(
      "useNotifications",
      "info",
      "notification-app-fe",
      `Notification created: ${nextNotification.title}`,
    );
    return nextNotification;
  };

  const deleteNotification = (notificationId) => {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== notificationId),
    );
    logEvent(
      "useNotifications",
      "info",
      "notification-app-fe",
      `Notification deleted: ${notificationId}`,
    );
  };

  const markAsRead = (notificationId) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    );
    logEvent(
      "useNotifications",
      "info",
      "notification-app-fe",
      `Notification marked as read: ${notificationId}`,
    );
  };

  return { notifications, totalPages, loading, error, createNotification, deleteNotification, markAsRead };
}
