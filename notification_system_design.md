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

# Stage 2

## Database Choice

So, for the database, I'm definitely going with **PostgreSQL**.

Why? Basically, Postgres is super robust and can handle pretty much anything we throw at it. Since notifications involve a lot of user data and we might need complex queries later on, a relational database just makes sense. Plus, it's open-source and free, which is perfect for a college project!

Here's how we're going to optimize it:

*   **Indexing:** We'll definitely need indexes on `user_id` and `is_read` so that pulling a user's unread notifications is super fast. If we don't index, the query will scan the whole table and get really slow.
*   **Pagination:** We can't just load all notifications at once if a user has thousands of them. We'll use cursor-based or offset pagination to load them in chunks (like 20 at a time) when the user scrolls down.
*   **Partitioning:** If this gets huge, we can partition the table by `created_at` (like splitting it into monthly chunks). This keeps the active data small and fast to query.
*   **Caching:** To save DB trips, we can use something like Redis to cache the unread notification count. That way, every time a user loads a page, we don't have to hit Postgres just to show that little red dot.
*   **Connection Pooling:** We'll use a connection pooler so we don't overwhelm Postgres with too many direct connections.

## SQL Schema

Here's the basic schema for the notifications table:

```sql
CREATE TABLE notifications(
 id UUID PRIMARY KEY,
 user_id UUID,
 message TEXT,
 type VARCHAR(20),
 is_read BOOLEAN,
 created_at TIMESTAMP
);
```
