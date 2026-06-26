const now = Date.now();

module.exports = [
  {
    id: "notif_1",
    title: "Placement drive update",
    message: "The placement drive starts at 10:00 AM in Hall A.",
    type: "Placement",
    userId: "user_456",
    isRead: false,
    timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "notif_2",
    title: "Result published",
    message: "Semester results are now available in the student portal.",
    type: "Result",
    userId: "user_456",
    isRead: true,
    timestamp: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
    createdAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "notif_3",
    title: "Campus event reminder",
    message: "Register for the annual tech fest before Friday.",
    type: "Event",
    userId: "user_456",
    isRead: false,
    timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
  },
];