import { useState } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Divider,
  Pagination,
  Stack,
  Typography,
  Tabs,
  Tab
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationForm } from "../components/NotificationForm";
import { useNotifications } from "../hooks/useNotifications";
import { logEvent } from "../utils/logger";

const PAGE_LIMIT = 3;

export function NotificationsPage() {
  const [currentTab, setCurrentTab] = useState("All");
  const [page, setPage] = useState(1);

  const { notifications, totalPages, loading, error, createNotification, deleteNotification, markAsRead } =
    useNotifications(currentTab, page, PAGE_LIMIT);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleCreateNotification = (notificationInput) => {
    createNotification(notificationInput);
    setPage(1);
    logEvent(
      "NotificationsPage",
      "info",
      "notification-app-fe",
      `Notification created: ${notificationInput.title}`,
    );
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(1);
    logEvent(
      "NotificationsPage",
      "info",
      "notification-app-fe",
      `Tab changed to ${newValue}`,
    );
  };

  const handlePageChange = (_, newPage) => {
    if (newPage < 1) return;
    setPage(newPage);
    logEvent("NotificationsPage", "info", "notification-app-fe", `Page changed to ${newPage}`);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
    logEvent("NotificationsPage", "info", "notification-app-fe", `Notification marked as read: ${notificationId}`);
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
    logEvent("NotificationsPage", "info", "notification-app-fe", `Notification deleted: ${notificationId}`);
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          aria-label="notification tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" value="All" />
          <Tab label="Event" value="Event" />
          <Tab label="Result" value="Result" />
          <Tab label="Placement" value="Placement" />
        </Tabs>
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

      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}

      {!loading && notifications.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
