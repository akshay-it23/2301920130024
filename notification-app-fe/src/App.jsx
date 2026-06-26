import { useEffect } from "react";

import { NotificationsPage } from "./pages/NotificationsPage";
import { logEvent } from "./utils/logger";

export default function App() {
  useEffect(() => {
    logEvent("App", "info", "notification-app-fe", "Application loaded");
  }, []);

  return <NotificationsPage />;
}