import { useEffect } from "react";

import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from "@mui/material";

import { logEvent } from "../utils/logger";

export function NotificationCard({ notification, onMarkAsRead, onDelete }) {
  useEffect(() => {
    if (!notification) {
      logEvent("NotificationCard", "error", "notification-app-fe", "Missing notification data");
    }
  }, [notification]);

  if (!notification) {
    return null;
  }

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        borderRadius: 3,
        opacity: notification.isRead ? 0.6 : 1,
        bgcolor: notification.isRead ? 'action.hover' : 'background.paper',
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              {notification.title}
            </Typography>
            <Chip
              label={notification.type}
              size="small"
              color={notification.isRead ? "default" : "primary"}
              variant={notification.isRead ? "outlined" : "filled"}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {notification.message}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {new Date(notification.timestamp).toLocaleString()}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: "flex-end" }}>
        {!notification.isRead && (
          <Button size="small" onClick={() => onMarkAsRead?.(notification.id)}>
            Mark as read
          </Button>
        )}
        <Button size="small" color="error" onClick={() => onDelete?.(notification.id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}