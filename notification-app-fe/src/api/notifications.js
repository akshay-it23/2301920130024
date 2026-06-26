import { logEvent } from "../utils/logger";

const packageName = "notification-app-fe";
const apiBaseUrl = import.meta.env.VITE_NOTIFICATION_API_BASE_URL ?? "http://127.0.0.1:3000/api";

function buildHeaders() {
	return {
		Authorization: "Bearer demo-token",
		"Content-Type": "application/json",
	};
}

export async function fetchNotifications(type = "All", page = 1, limit = 5) {
	try {
		logEvent("fetchNotifications", "info", packageName, "API request started");

		const url = new URL(`${apiBaseUrl}/notifications`);
		
		if (type !== "All") {
			url.searchParams.append("notification_type", type);
		}
		
		url.searchParams.append("page", page);
		url.searchParams.append("limit", limit);

		const response = await fetch(url, {
			headers: buildHeaders(),
		});
		
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

export async function createNotification(notificationInput) {
	try {
		logEvent("createNotification", "info", packageName, "API request started");
		const response = await fetch(`${apiBaseUrl}/notifications`, {
			method: "POST",
			headers: buildHeaders(),
			body: JSON.stringify(notificationInput),
		});

		if (!response.ok) {
			throw new Error(`Server error: ${response.status}`);
		}

		const data = await response.json();
		logEvent("createNotification", "info", packageName, `API success: created ${data.notification?.id ?? "notification"}`);
		return data.notification;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error occurred";
		logEvent("createNotification", "error", packageName, `API failure: ${message}`);
		throw error;
	}
}

export async function markNotificationAsRead(notificationId) {
	try {
		logEvent("markNotificationAsRead", "info", packageName, "API request started");
		const response = await fetch(`${apiBaseUrl}/notifications/${notificationId}/read`, {
			method: "PUT",
			headers: buildHeaders(),
		});

		if (!response.ok) {
			throw new Error(`Server error: ${response.status}`);
		}

		const data = await response.json();
		logEvent("markNotificationAsRead", "info", packageName, `API success: marked ${notificationId} as read`);
		return data.notification;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error occurred";
		logEvent("markNotificationAsRead", "error", packageName, `API failure: ${message}`);
		throw error;
	}
}

export async function deleteNotification(notificationId) {
	try {
		logEvent("deleteNotification", "info", packageName, "API request started");
		const response = await fetch(`${apiBaseUrl}/notifications/${notificationId}`, {
			method: "DELETE",
			headers: buildHeaders(),
		});

		if (!response.ok && response.status !== 204) {
			throw new Error(`Server error: ${response.status}`);
		}

		logEvent("deleteNotification", "info", packageName, `API success: deleted ${notificationId}`);
		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error occurred";
		logEvent("deleteNotification", "error", packageName, `API failure: ${message}`);
		throw error;
	}
}
