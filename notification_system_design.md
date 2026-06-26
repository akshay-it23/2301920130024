# Stage 1

Yo, so here's the vibe for the notification system REST APIs. 

## REST APIs

We basically need these endpoints so things actually work:

* `GET /notifications` - Gimme all my notifications bro.
* `POST /notifications` - Make a new notification happen.
* `PUT /notifications/:id/read` - Mark that one notification as read so the red dot goes away.
* `DELETE /notifications/:id` - Delete it 'cause I don't want to see it anymore.

## JSON Structure

This is what the data looks like, just a basic JSON thing:

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

## Extra Stuff

**Headers:**
You gotta send an `Authorization` header or else the server's gonna be like "who are you?" and block you.

**Status Codes:**
Just normal internet numbers:
* `200 OK` - It worked, chill.
* `201 Created` - We made the thing.
* `400 Bad Request` - You messed up sending the data.
* `401 Unauthorized` - You're not logged in, dude.
* `404 Not Found` - That notification straight up doesn't exist.
* `500 Internal Server Error` - The server caught on fire.

**Response Examples:**

If you ask for notifications, it spits this out:

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

I'm picking **PostgreSQL** because honestly everyone uses it and it's free.

Why? It's like, super reliable and doesn't crash when you look at it funny. It's a relational database which is good because notifications have relations and stuff. Perfect for a project where we have zero budget.

Here's how we're gonna make it not slow:

*   **Indexing:** We need indexes on `user_id` and `is_read`. If we don't, the DB is gonna read the whole table and my laptop will probably melt trying to load the page.
*   **Pagination:** Don't load 10,000 notifications at once. Just load like 20 when they scroll. Duh.
*   **Partitioning:** If we get too many rows, we just slice the table into monthly chunks so it doesn't get ridiculously big.
*   **Caching:** Throw Redis in there so we don't have to bother Postgres every time we just need to know if they have 3 unread messages. 
*   **Connection Pooling:** Use this so Postgres doesn't freak out if 50 students try to check their notifications at the same exact time right before class.

## SQL Schema

Here's the table code thing:

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

# Stage 3

## Why is it so slow tho?

Someone asked why this query is taking literally forever:

```sql
SELECT * FROM notifications
WHERE studentId=1042
AND isRead=false
ORDER BY createdAt;
```

Here's why it's being dumb:

1.  **No Index:** There's no index, so the database has no clue where to look. It's like looking for a word in a book without an index page.
2.  **Full Table Scan:** It's literally checking every single row one by one. If we have a million notifications, it's gonna take all day.
3.  **Sorting is Expensive:** The `ORDER BY createdAt` part means it has to take all that messy data and organize it in memory before it gives it to you. That takes up so much brain power for the server.

## The Fix

Just make a composite index like this, it fixes everything:

```sql
CREATE INDEX idx_notification
ON notifications(studentId, isRead, createdAt DESC);
```

## Complexity Improvement

Okay, so the math side of why this helps:

*   **Before (Full Table Scan + Sort):** The time complexity is like `O(N + M log M)`. Basically N is the whole table and M is the stuff it finds. It has to scan everything and then sort it, which is terrible.
*   **After (B-Tree Index Scan):** With the index, it's `O(log N)`. And because we put `createdAt DESC` right in the index, it's ALREADY SORTED! The database doesn't have to do the heavy lifting anymore. So it's just `O(log N + K)` (K is the few rows we actually want). 

Basically, we stopped being stupid and making the server read everything, and now it just skips to the good part instantly.

# Stage 4

## How to stop the database from dying

If everyone checks their notifications during midterms, our Postgres server is totally gonna crash. Here's how we reduce the load on the DB so that doesn't happen:

*   **Redis Cache:** We don't need to ask the database "how many unread messages does bro have?" every single time they load a page. We just stash that number in a Redis cache (which is like, super fast temporary memory). 
*   **API Cache:** If someone just refreshed their notifications like two seconds ago, we shouldn't hit the DB again. We just cache the API response for a bit and give them the saved copy.
*   **Pagination & Infinite Scroll:** Instead of forcing the DB to spit out all 500 of someone's old notifications at once, we only grab the first 15. Then, when they scroll down (infinite scroll style), we just lazy load the next 15. The DB barely has to do any work this way.
*   **CDN (Content Delivery Network)? Nah:** CDNs are awesome for caching static stuff like images or big CSS files globally. But notifications are totally personal to each user and constantly changing, so a CDN is completely useless here. Don't even bother.

# Stage 5

## How to blast 50,000 students without breaking everything

Someone asked how we actually send a notification to like, the entire campus at once. 

If we do it the stupid way, the architecture looks like this:

**The Stupid Way (Don't do this):**
```text
Loop through 50k users 
       ↓
  Send Email 
       ↓
   Save to DB
```
Why is this bad? Because sending an email takes time. If one email takes half a second, we're making the server sit there spinning for hours. The whole app will literally freeze and crash.

**The Smart Way:**
Instead, we gotta do this asynchronously using a Message Queue so the main server doesn't get stuck.

```text
  Notify All 
       ↓
 Message Queue (It just holds the tasks)
       ↓
    Workers (Background guys doing the hard work)
   ↓       ↓
 Email    Push
```

Basically, the main server just dumps 50,000 sticky notes into a bucket (the queue) and says "I'm done!" instantly. Then, background worker programs grab those notes from the bucket one by one and actually send the emails or push notifications.

## Tools to use
To make the bucket thing work, we can use stuff like:
*   **RabbitMQ:** Solid, old-school choice.
*   **Kafka:** Super heavy duty if we suddenly become the next Facebook.
*   **BullMQ:** Really nice if we are just using Node.js and Redis.

## Retries (Because stuff breaks)
What happens if the email server is down or a phone has no signal? With the message queue, if a worker fails to send a message, it doesn't just give up and cry. It tosses the sticky note back into the bucket to **retry** later. We can tell it to try like 3 times before finally giving up, so we don't accidentally miss someone.
