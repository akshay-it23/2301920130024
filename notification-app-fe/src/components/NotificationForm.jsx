import { useState } from "react";

import { Alert, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";

import { logEvent } from "../utils/logger";

const notificationTypes = ["Placement", "Result", "Event"];

export function NotificationForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Placement");
  const [formError, setFormError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle || !trimmedMessage || !type) {
      const nextError = "Title, message, and type are required.";
      setFormError(nextError);
      logEvent(
        "NotificationForm",
        "warn",
        "notification-app-fe",
        `Validation warning: ${nextError}`,
      );
      return;
    }

    onCreate?.({ title: trimmedTitle, message: trimmedMessage, type });
    setTitle("");
    setMessage("");
    setType("Placement");
    setFormError("");

    logEvent("NotificationForm", "info", "notification-app-fe", `Notification submitted: ${trimmedTitle}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Create Notification
        </Typography>

        {formError && <Alert severity="warning">{formError}</Alert>}

        <TextField
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          fullWidth
          required
          multiline
          minRows={3}
        />

        <TextField
          select
          label="Type"
          value={type}
          onChange={(event) => setType(event.target.value)}
          fullWidth
          required
        >
          {notificationTypes.map((typeOption) => (
            <MenuItem key={typeOption} value={typeOption}>
              {typeOption}
            </MenuItem>
          ))}
        </TextField>

        <Button type="submit" variant="contained">
          Create notification
        </Button>
      </Stack>
    </form>
  );
}