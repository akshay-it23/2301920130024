# Stage 1

Here is the initial design for the notification system REST APIs.

## REST APIs

We will expose the following endpoints to manage notifications:

* `GET /notifications` - To fetch a list of notifications for the current user.
* `POST /notifications` - To create a brand new notification.
* `PUT /notifications/:id/read` - To mark a specific notification as read.
* `DELETE /notifications/:id` - To remove a notification.

## JSON Structure

A standard notification object will have this JSON structure:

```json
{
  "id": "",
  "title": "",
  "message": "",
  "type": "Event",
  "userId": "",
  "isRead": false,
  "createdAt": ""
}
```

## Additional Details

**Headers:**
All requests will require an `Authorization` header to ensure only authenticated users can access or modify their notifications.

**Status Codes:**
We'll use standard HTTP status codes to indicate the result of a request. For example:
* `200 OK` for successful operations.
* `201 Created` when a notification is successfully posted.
* `400 Bad Request` if the request payload is invalid.
* `401 Unauthorized` if the user is not authenticated.
* `404 Not Found` if trying to read or delete a notification that doesn't exist.
* `500 Internal Server Error` for any server-side hiccups.

**Response Examples:**

Here's an example of what a successful response from `GET /notifications` might look like:

```json
[
  {
    "id": "notif_123",
    "title": "System Update",
    "message": "The system will be down for maintenance at midnight.",
    "type": "Event",
    "userId": "user_456",
    "isRead": false,
    "createdAt": "2026-06-26T12:00:00Z"
  }
]
```
