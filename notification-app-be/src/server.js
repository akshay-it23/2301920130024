const express = require("express");
const cors = require("cors");

const log = require("../../logging-middleware");
const notificationsRouter = require("./routes/notifications");

const app = express();
const port = process.env.PORT || 3000;
const packageName = "notification-app-be";

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  log("request", "info", packageName, `${req.method} ${req.originalUrl}`);
  next();
});

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

app.use("/api/notifications", notificationsRouter);

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  log("error", "error", packageName, err.message || "Unexpected server error");
  return res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  log("server", "info", packageName, `Backend listening on port ${port}`);
});