import { logEvent } from "../utils/logger";

const packageName = "notification-app-fe";

export async function fetchNotifications(type = "All", page = 1, limit = 5) {
	try {
		logEvent("fetchNotifications", "info", packageName, "API request started");

		const url = new URL("http://4.224.186.213/evaluation-service/notifications");
		
		if (type !== "All") {
			url.searchParams.append("notification_type", type);
		}
		
		url.searchParams.append("page", page);
		url.searchParams.append("limit", limit);

		const response = await fetch(url);
		
		if (!response.ok) {
			throw new Error(`Server error: ${response.status}`);
		}
		
		const data = await response.json();
		
		let notifications = Array.isArray(data) ? data : (data.notifications || []);
		
		let totalPages = data.totalPages || 5; 

		logEvent(
			"fetchNotifications",
			"info",
			packageName,
			`API success: pulled ${notifications.length} notifications`,
		);

		return { notifications, totalPages };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error occurred";
		logEvent("fetchNotifications", "error", packageName, `API failure: ${message}`);
		throw error;
	}
}
