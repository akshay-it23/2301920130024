import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationForm } from "../components/NotificationForm";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { logEvent } from "../utils/logger";

const pageSize = 3;

export function NotificationsPage() {
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { notifications, loading, error, createNotification, deleteNotification, markAsRead } =
    useNotifications();

  const filteredNotifications = useMemo(() => {
    if (filter === "All") {
      return notifications;
    }

    return notifications.filter((notification) => notification.type === filter);
  }, [filter, notifications]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleNotifications = filteredNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleCreateNotification = (notificationInput) => {
    createNotification(notificationInput);
    setPage(1);
    logEvent(
      "NotificationsPage",
      "info",
      "notification-app-fe",
      `Create notification flow completed for ${notificationInput.title}`,
    );
  };

  const handleFilterChange = (newFilter) => {
    if (!newFilter) {
      logEvent("NotificationsPage", "warn", "notification-app-fe", "Validation warning: empty filter ignored");
      return;
    }

    setFilter(newFilter);
    setPage(1);
    logEvent(
      "NotificationsPage",
      "info",
      "notification-app-fe",
      `Filter changed to ${newFilter}`,
    );

  };

  const handlePageChange = (_, newPage) => {
    if (newPage < 1) {
      logEvent("NotificationsPage", "warn", "notification-app-fe", "Validation warning: invalid page requested");
      return;
    }

    setPage(newPage);
    logEvent("NotificationsPage", "info", "notification-app-fe", `Page changed to ${newPage}`);

  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
    logEvent("NotificationsPage", "info", "notification-app-fe", `Marked as read: ${notificationId}`);
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
    logEvent("NotificationsPage", "info", "notification-app-fe", `Deleted notification: ${notificationId}`);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }} mb={3}>
        <Badge badgeContent={unreadCount} color="primary" max={99}>
          <NotificationsIcon sx={{ fontSize: 28 }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ marginBottom: 3 }}>
        <NotificationForm onCreate={handleCreateNotification} />
      </Box>

      <Box sx={{ marginBottom: 3 }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error">Failed to load notifications: {error}</Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found.</Alert>
      )}

      {!loading && !error && filteredNotifications.length > 0 && (
        <Stack spacing={1.5}>
          {visibleNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}

      {!loading && filteredNotifications.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
