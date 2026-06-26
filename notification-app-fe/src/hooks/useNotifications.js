import { useEffect, useState } from "react";
import {
  createNotification as createNotificationRequest,
  deleteNotification as deleteNotificationRequest,
  fetchNotifications,
  markNotificationAsRead as markNotificationAsReadRequest,
} from "../api/notifications";
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

  const refreshNotifications = async () => {
    const data = await fetchNotifications(filter, page, limit);

    setNotifications(data.notifications ?? []);
    setTotalPages(data.totalPages ?? 1);
  };

  const createNotification = async (notificationInput) => {
    const nextNotification = await createNotificationRequest(notificationInput);

    setNotifications((currentNotifications) => [nextNotification, ...currentNotifications]);
    setTotalPages((currentTotalPages) => Math.max(1, currentTotalPages));

    logEvent("useNotifications", "info", "notification-app-fe", `Notification created: ${nextNotification.title}`);
    return nextNotification;
  };

  const deleteNotification = async (notificationId) => {
    await deleteNotificationRequest(notificationId);
    await refreshNotifications();
    logEvent("useNotifications", "info", "notification-app-fe", `Notification deleted: ${notificationId}`);
  };

  const markAsRead = async (notificationId) => {
    await markNotificationAsReadRequest(notificationId);
    await refreshNotifications();
    logEvent("useNotifications", "info", "notification-app-fe", `Notification marked as read: ${notificationId}`);
  };

  return { notifications, totalPages, loading, error, createNotification, deleteNotification, markAsRead };
}
