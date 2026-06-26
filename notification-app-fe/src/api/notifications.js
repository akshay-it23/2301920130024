import { logEvent } from "../utils/logger";

const packageName = "notification-app-fe";

const sampleNotifications = [
	{
		id: 1,
		title: "Placement drive update",
		message: "The placement drive starts at 10:00 AM in Hall A.",
		type: "Placement",
		isRead: false,
		timestamp: "2026-06-26T09:00:00.000Z",
	},
	{
		id: 2,
		title: "Result published",
		message: "Semester results are now available in the student portal.",
		type: "Result",
		isRead: true,
		timestamp: "2026-06-25T15:30:00.000Z",
	},
	{
		id: 3,
		title: "Campus event reminder",
		message: "Register for the annual tech fest before Friday.",
		type: "Event",
		isRead: false,
		timestamp: "2026-06-24T12:15:00.000Z",
	},
];

export async function fetchNotifications() {
	try {
		logEvent("fetchNotifications", "info", packageName, "API request started");

		const data = {
			notifications: sampleNotifications,
			totalPages: 1,
		};

		logEvent(
			"fetchNotifications",
			"info",
			packageName,
			`API success: ${data.notifications.length} notifications loaded`,
		);

		return data;
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		logEvent("fetchNotifications", "error", packageName, `API failure: ${message}`);
		throw error;
	}
}
