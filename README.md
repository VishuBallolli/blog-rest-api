# Blog REST API

A small REST API for creating, reading, updating, and deleting blog posts. The project is built with Node.js, Express.js, and MySQL and is intentionally limited to the post-management workflow so it can be run locally and tested with Postman.

## Problem Statement

Blog applications need a consistent way to store and manage posts. Without a defined HTTP API and database model, clients cannot reliably create posts, retrieve existing content, update records, or delete records.

## Objective

Provide a simple, testable backend that exposes CRUD endpoints for blog posts, persists data in MySQL, validates incoming requests, and returns clear HTTP status codes and JSON responses.

## Features

- Create, list, retrieve, update, and delete blog posts
- MySQL persistence using a connection pool
- Parameterized SQL queries
- Request validation for post fields and numeric IDs
- API and database health check
- Centralized asynchronous error handling
- JSON responses suitable for Postman testing

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Database driver:** `mysql2/promise`
- **Configuration:** `dotenv`
- **Module system:** CommonJS

## Requirements

- Node.js 18 or newer
- MySQL 8 or newer
- MySQL client available on your PATH, or another way to run `database/schema.sql`

## Expected User Flow

1. Start the local MySQL server.
2. Initialize the `blog_api` database and `posts` table.
3. Configure the database connection in `backend/.env`.
4. Install the backend dependencies.
5. Start the backend server.
6. Call the health endpoint to confirm that the API can connect to MySQL.
7. Create a post with `POST /api/posts`.
8. Read posts with `GET /api/posts` or `GET /api/posts/:id`.
9. Replace a post with `PUT /api/posts/:id`.
10. Remove a post with `DELETE /api/posts/:id`.

## Folder Structure

```text
.
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── postsController.js
│   ├── middleware/
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   └── validatePost.js
│   ├── routes/
│   │   └── posts.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── database/
│   └── schema.sql
└── README.md
```

## MySQL Database Setup

From the project root, run the schema script with a MySQL user that can create databases and tables:

```bash
mysql -u root -p < database/schema.sql
```

The script creates the `blog_api` database if it does not exist, selects it, and creates the `posts` table if it does not exist. The API expects the database server to be available at the host, port, and credentials configured in `.env`.

## Database Model

The `blog_api` database currently contains one table, `posts`:

| Column | MySQL type | Constraints and behavior |
| --- | --- | --- |
| `id` | `INT UNSIGNED` | Primary key, auto-incrementing, required |
| `title` | `VARCHAR(255)` | Required |
| `content` | `TEXT` | Required |
| `author` | `VARCHAR(100)` | Required |
| `created_at` | `TIMESTAMP` | Defaults to the row creation time |
| `updated_at` | `TIMESTAMP` | Defaults to creation time and updates automatically when the row changes |

## Environment Variables

Create or update `backend/.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=blog_api
DB_CONNECTION_LIMIT=10
```

`DB_PASSWORD` is empty in the current local configuration. Set it to the password for your MySQL user when one is required. Do not commit real credentials to a public repository.

| Variable | Purpose | Default used by the backend |
| --- | --- | --- |
| `PORT` | HTTP server port | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | Empty string |
| `DB_NAME` | MySQL database | `blog_api` |
| `DB_CONNECTION_LIMIT` | Maximum pooled connections | `10` |

## Installation

Install dependencies from the backend directory:

```bash
cd backend
npm install
```

## Starting the Backend

From `backend/`, start the server with:

```bash
npm start
```

The development script uses Node's watch mode:

```bash
npm run dev
```

By default, the backend listens at `http://localhost:3000`.

## Health Endpoint

### `GET /api/health`

Checks that the API process can execute a database query.

Successful response, `200 OK`:

```json
{
  "status": "ok",
  "database": "connected"
}
```

If the database query fails, the centralized error handler returns a `500 Internal Server Error` response.

## CRUD API

All request bodies must use `Content-Type: application/json`. Timestamps are returned as strings by the MySQL driver.

### List posts

```http
GET /api/posts
```

Returns all posts ordered by `created_at` descending.

Successful response, `200 OK`:

```json
[
  {
    "id": 1,
    "title": "My first post",
    "content": "Hello from the API.",
    "author": "Jane Doe",
    "created_at": "2026-09-21 10:00:00",
    "updated_at": "2026-09-21 10:00:00"
  }
]
```

### Get one post

```http
GET /api/posts/:id
```

Example: `GET /api/posts/1`

Returns the requested post with `200 OK`, or returns `404 Not Found` when the post does not exist.

### Create a post

```http
POST /api/posts
```

Request body:

```json
{
  "title": "My first post",
  "content": "Hello from the API.",
  "author": "Jane Doe"
}
```

Returns the created post with `201 Created`.

### Update a post

```http
PUT /api/posts/:id
```

Example: `PUT /api/posts/1`

The request body must contain all three post fields:

```json
{
  "title": "Updated title",
  "content": "Updated content.",
  "author": "Jane Doe"
}
```

Returns the updated post with `200 OK`, or returns `404 Not Found` when the post does not exist.

### Delete a post

```http
DELETE /api/posts/:id
```

Example: `DELETE /api/posts/1`

Returns `204 No Content` after deletion. The response has no body. If the post does not exist, the API returns `404 Not Found`.

## Validation Rules

- `title` is required, must be a non-empty string after trimming, and must be no longer than 255 characters.
- `content` is required and must be a non-empty string after trimming.
- `author` is required, must be a non-empty string after trimming, and must be no longer than 100 characters.
- `id` must be a positive integer.
- `POST` and `PUT` validate the request body before executing a database query.
- `PUT` replaces all editable post fields; partial updates are not supported.

Example validation response, `400 Bad Request`:

```json
{
  "error": "Validation failed",
  "details": [
    "title is required and must be a non-empty string",
    "author is required and must be a non-empty string"
  ]
}
```

## HTTP Status Codes

| Status | Meaning | Used by this API |
| --- | --- | --- |
| `200 OK` | Request succeeded | Health, list, and read operations; successful updates |
| `201 Created` | Resource created | Successful post creation |
| `204 No Content` | Request succeeded with no response body | Successful post deletion |
| `400 Bad Request` | Request input is invalid | Invalid JSON, validation errors, or invalid post IDs |
| `404 Not Found` | Route or resource does not exist | Unknown routes and missing posts |
| `500 Internal Server Error` | Unexpected server or database failure | Unhandled application and database errors |

## Postman Testing Workflow

1. Start MySQL and run `database/schema.sql`.
2. Configure `backend/.env` and run `npm install` and `npm start` from `backend/`.
3. Create a Postman environment variable named `baseUrl` with the value `http://localhost:3000`.
4. Send `GET {{baseUrl}}/api/health` and confirm the `200` response.
5. Send `POST {{baseUrl}}/api/posts` with a raw JSON body and the `Content-Type: application/json` header.
6. Send `GET {{baseUrl}}/api/posts` and copy an existing post ID.
7. Send `GET {{baseUrl}}/api/posts/:id` using that ID.
8. Send `PUT {{baseUrl}}/api/posts/:id` with a complete replacement body.
9. Send `DELETE {{baseUrl}}/api/posts/:id` and confirm the `204` response.
10. Try an invalid ID, missing field, unknown ID, and malformed JSON to verify the error responses.

## Error Handling

Asynchronous route errors are forwarded to a centralized error handler. Invalid JSON returns a `400` response:

```json
{
  "error": "Request body must contain valid JSON"
}
```

Unknown routes return `404` with the requested method and URL. Missing posts return:

```json
{
  "error": "Post not found"
}
```

Unexpected errors are logged by the backend and return:

```json
{
  "error": "Internal server error"
}
```

## Future Improvements

These items are not currently implemented:

- Automated unit and integration tests
- Pagination and filtering for the posts list
- API request logging
- OpenAPI documentation
- Database migrations and seed data
- More granular operational health and readiness checks
