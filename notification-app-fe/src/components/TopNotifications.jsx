import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert, Stack, Card, CardContent, Chip } from "@mui/material";

export function TopNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://4.224.186.213/evaluation-service/notifications");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Priority Mapping
        const priorityScore = {
          "Result": 3,
          "Placement": 2,
          "Event": 1
        };

        // Sort by Priority (descending) and then Latest Timestamp (descending)
        const sortedData = [...data].sort((a, b) => {
          const scoreA = priorityScore[a.type] || 0;
          const scoreB = priorityScore[b.type] || 0;

          // Primary Sort: Priority
          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }

          // Secondary Sort: Latest timestamp
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Get Top 10 notifications
        setNotifications(sortedData.slice(0, 10));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopNotifications();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load top notifications: {error}</Alert>;
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        🔥 Top 10 Priority Notifications
      </Typography>
      <Stack spacing={2}>
        {notifications.map((notif) => (
          <Card key={notif.id} variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {notif.title}
                </Typography>
                <Chip 
                  label={notif.type} 
                  color={
                    notif.type === "Result" ? "error" : 
                    notif.type === "Placement" ? "warning" : "info"
                  }
                  size="small"
                />
              </Box>
              <Typography variant="body2" mb={1}>
                {notif.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(notif.createdAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
