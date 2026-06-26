const express = require("express");

const log = require("../../logging-middleware");
const {
  createNotification,
  deleteNotification,
  listNotifications,
  markNotificationAsRead,
} = require("../store/notificationStore");

const router = express.Router();
const packageName = "notification-app-be";

function requireAuth(req, res, next) {
  const authorization = req.header("authorization");

  if (!authorization) {
    log("auth", "warn", packageName, "Unauthorized request blocked");
    return res.status(401).json({ message: "Authorization header required" });
  }

  return next();
}

function validateNotificationPayload(payload) {
  const errors = [];

  if (!payload.title || typeof payload.title !== "string" || !payload.title.trim()) {
    errors.push("title is required");
  }

  if (!payload.message || typeof payload.message !== "string" || !payload.message.trim()) {
    errors.push("message is required");
  }

  const allowedTypes = ["Placement", "Result", "Event"];
  if (!payload.type || !allowedTypes.includes(payload.type)) {
    errors.push("type must be one of Placement, Result, or Event");
  }

  return errors;
}

router.use(requireAuth);

router.get("/", (req, res) => {
  const data = listNotifications({
    notificationType: req.query.notification_type,
    page: req.query.page,
    limit: req.query.limit,
  });

  log(
    "GET /notifications",
    "info",
    packageName,
    `Returned ${data.notifications.length} notifications from ${data.totalCount} total`,
  );

  return res.json(data);
});

router.post("/", (req, res) => {
  const errors = validateNotificationPayload(req.body);

  if (errors.length > 0) {
    log("POST /notifications", "warn", packageName, `Validation failed: ${errors.join(", ")}`);
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const notification = createNotification(req.body);

  log("POST /notifications", "info", packageName, `Created notification ${notification.id}`);
  return res.status(201).json({ notification });
});

router.put("/:id/read", (req, res) => {
  const notification = markNotificationAsRead(req.params.id);

  if (!notification) {
    log("PUT /notifications/:id/read", "warn", packageName, `Notification ${req.params.id} not found`);
    return res.status(404).json({ message: "Notification not found" });
  }

  log("PUT /notifications/:id/read", "info", packageName, `Marked ${req.params.id} as read`);
  return res.json({ notification });
});

router.delete("/:id", (req, res) => {
  const wasDeleted = deleteNotification(req.params.id);

  if (!wasDeleted) {
    log("DELETE /notifications/:id", "warn", packageName, `Notification ${req.params.id} not found`);
    return res.status(404).json({ message: "Notification not found" });
  }

  log("DELETE /notifications/:id", "info", packageName, `Deleted notification ${req.params.id}`);
  return res.status(204).send();
});

module.exports = router;