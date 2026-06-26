import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import { logEvent } from "../utils/logger";

const filters = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value, onChange }) {
  const handleChange = (_, newValue) => {
    const selectedFilter = newValue ?? "All";

    logEvent(
      "NotificationFilter",
      "info",
      "notification-app-fe",
      `Filter selected: ${selectedFilter}`,
    );

    onChange?.(selectedFilter);
  };

  return (
    <ToggleButtonGroup
      value={value ?? "All"}
      onChange={handleChange}
      exclusive
      size="small"
      sx={{ flexWrap: "wrap", gap: 0.5 }}
    >
      {filters.map((type) => (
        <ToggleButton key={type} value={type} sx={{ textTransform: "none", px: 2 }}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}