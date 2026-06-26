import { useEffect } from "react";
import { Box } from "@mui/material";

import { NotificationsPage } from "./pages/NotificationsPage";
import { TopNotifications } from "./components/TopNotifications";
import { logEvent } from "./utils/logger";

export default function App() {
  useEffect(() => {
    logEvent("App", "info", "notification-app-fe", "Application loaded");
  }, []);

  return (
    <Box>
      <NotificationsPage />
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2, pb: 4 }}>
        <TopNotifications />
      </Box>
    </Box>
  );
}