# API Contract

**Project:** Support Ticket Management System  
**Base URL:** `http://127.0.0.1:8000/api`  
**Format:** JSON (`Content-Type: application/json`)

---

## General Conventions

### Authentication Header

Protected endpoints require a valid token:

```http
Authorization: Token <auth-token>
```

### Standard Response Envelope

| Pattern | Shape |
|---------|-------|
| Single resource | JSON object |
| Paginated list | `{ "count", "next", "previous", "results" }` |
| Delete success | `204 No Content` (empty body) |
| Validation error | `{ "<field>": ["<message>", ...] }` |
| Auth error | `{ "detail": "<message>" }` |

### Pagination

List endpoints use **page-number pagination** with a default page size of **20**.

| Query Param | Type | Description |
|-------------|------|-------------|
| `page` | integer | Page number (default: `1`) |

### Roles

| Role | Value |
|------|-------|
| Customer | `customer` |
| Agent | `agent` |
| Admin | `admin` |

---

## Enumerations

### Ticket Status

| Value | Label |
|-------|-------|
| `open` | Open |
| `in_progress` | In Progress |
| `waiting_on_customer` | Waiting on Customer |
| `resolved` | Resolved |
| `reopened` | Reopened |
| `closed` | Closed |

### Ticket Priority

| Value | Label |
|-------|-------|
| `low` | Low |
| `medium` | Medium |
| `high` | High |
| `urgent` | Urgent |

### Ticket Category

| Value | Label |
|-------|-------|
| `it_support` | IT Support |
| `access` | Access |
| `admin_issue` | Admin Issue |
| `hr` | HR |

---

## Shared Object Schemas

### User

```json
{
  "id": 1,
  "username": "customer_alice",
  "email": "alice@example.com",
  "role": "customer"
}
```

### UserSummary

Nested on tickets and comments:

```json
{
  "id": 1,
  "username": "customer_alice",
  "email": "alice@example.com"
}
```

### Ticket (List)

```json
{
  "id": 1,
  "ticket_number": "TKT-00001",
  "title": "Cannot access email",
  "status": "open",
  "priority": "medium",
  "category": "it_support",
  "created_by": { "id": 1, "username": "customer_alice", "email": "alice@example.com" },
  "assigned_to": null,
  "created_at": "2026-07-28T10:00:00Z",
  "updated_at": "2026-07-28T10:00:00Z"
}
```

### Ticket (Detail)

```json
{
  "id": 1,
  "ticket_number": "TKT-00001",
  "title": "Cannot access email",
  "description": "I am unable to log into my corporate email account.",
  "status": "open",
  "priority": "medium",
  "category": "it_support",
  "created_by": { "id": 1, "username": "customer_alice", "email": "alice@example.com" },
  "assigned_to": null,
  "created_at": "2026-07-28T10:00:00Z",
  "updated_at": "2026-07-28T10:00:00Z",
  "resolved_at": null,
  "closed_at": null
}
```

### Comment

```json
{
  "id": 1,
  "ticket": 1,
  "ticket_number": "TKT-00001",
  "author": { "id": 1, "username": "customer_alice", "email": "alice@example.com" },
  "body": "This issue started after the password reset.",
  "is_internal": false,
  "created_at": "2026-07-28T11:00:00Z"
}
```

---

## Authentication Endpoints

### Register

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/auth/register/` |
| **Authentication** | None (public) |

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `username` | string | Yes | Non-blank after trim; must be unique |
| `email` | string | No | Valid email format |
| `password` | string | Yes | Minimum 8 characters |

```json
{
  "username": "customer_alice",
  "email": "alice@example.com",
  "password": "password123"
}
```

#### Response `201 Created`

```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "customer_alice",
    "email": "alice@example.com",
    "role": "customer"
  }
}
```

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Validation failure | `{ "username": ["A user with that username already exists."] }` |
| `400` | Password too short | `{ "password": ["Ensure this field has at least 8 characters."] }` |
| `400` | Blank username | `{ "username": ["Username cannot be blank."] }` |

---

### Login

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/auth/login/` |
| **Authentication** | None (public) |

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `username` | string | Yes | Must match an existing user |
| `password` | string | Yes | Must match the user's password |

```json
{
  "username": "customer_alice",
  "password": "password123"
}
```

#### Response `200 OK`

```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "customer_alice",
    "email": "alice@example.com",
    "role": "customer"
  }
}
```

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid credentials | `{ "non_field_errors": ["Invalid username or password."] }` |
| `400` | Missing fields | `{ "username": ["This field is required."] }` |

---

### Current User

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/auth/me/` |
| **Authentication** | Required |

#### Request Body

None.

#### Response `200 OK`

```json
{
  "id": 1,
  "username": "customer_alice",
  "email": "alice@example.com",
  "role": "customer"
}
```

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Missing or invalid token | `{ "detail": "Authentication credentials were not provided." }` |

---

## Ticket Endpoints

### List Tickets

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/tickets/` |
| **Authentication** | Required |

#### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | integer | No | Page number (default: `1`) |
| `search` | string | No | Case-insensitive search in title and description |
| `status` | string | No | Filter by ticket status (see enumerations) |
| `priority` | string | No | Filter by priority (see enumerations) |
| `category` | string | No | Filter by category (see enumerations) |

#### Request Body

None.

#### Response `200 OK`

```json
{
  "count": 42,
  "next": "http://127.0.0.1:8000/api/tickets/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "ticket_number": "TKT-00001",
      "title": "Cannot access email",
      "status": "open",
      "priority": "medium",
      "category": "it_support",
      "created_by": { "id": 1, "username": "customer_alice", "email": "alice@example.com" },
      "assigned_to": null,
      "created_at": "2026-07-28T10:00:00Z",
      "updated_at": "2026-07-28T10:00:00Z"
    }
  ]
}
```

#### Access Rules

| Role | Scope |
|------|-------|
| Customer | Own tickets only (`created_by` = current user) |
| Agent / Admin | All tickets |

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |
| `400` | Invalid filter value | `{ "status": ["Select a valid choice. ..."] }` |

---

### Create Ticket

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/tickets/` |
| **Authentication** | Required |

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Non-blank; minimum 5 characters after trim |
| `description` | string | Yes | Non-blank; minimum 10 characters after trim |
| `category` | string | No | One of ticket categories (default: `it_support`) |
| `priority` | string | No | One of ticket priorities (default: `medium`) |

```json
{
  "title": "VPN not connecting",
  "description": "My VPN client fails every time I try to connect.",
  "category": "it_support",
  "priority": "high"
}
```

#### Response `201 Created`

Returns a full **Ticket (Detail)** object. `status` is `open`, `ticket_number` is auto-generated, `created_by` is set from the authenticated user.

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Title too short | `{ "title": ["Title must be at least 5 characters long."] }` |
| `400` | Description too short | `{ "description": ["Description must be at least 10 characters long."] }` |
| `400` | Invalid category/priority | `{ "priority": ["\"invalid\" is not a valid choice."] }` |
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |

---

### Ticket Statistics

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/tickets/stats/` |
| **Authentication** | Required |

#### Request Body

None.

#### Response `200 OK` — Customer

```json
{
  "total": 3,
  "by_status": {
    "open": 1,
    "in_progress": 1,
    "waiting_on_customer": 0,
    "resolved": 1,
    "reopened": 0,
    "closed": 0
  },
  "by_priority": {
    "low": 0,
    "medium": 2,
    "high": 1,
    "urgent": 0
  },
  "open_pipeline": 2,
  "needs_attention": 0,
  "active": 2,
  "recent_tickets": [ /* array of Ticket (List) objects, max 5 */ ]
}
```

#### Response `200 OK` — Agent / Admin

Same as customer, plus:

```json
{
  "assigned_to_me": 2,
  "unassigned": 1,
  "urgent_open": 1
}
```

Customer responses do **not** include `assigned_to_me`, `unassigned`, or `urgent_open`.  
Agent/admin responses do **not** include `needs_attention` or `active`.

#### Access Rules

Counts are scoped the same as the ticket list (customers see own tickets only).

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |

---

### Retrieve Ticket

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/tickets/{id}/` |
| **Authentication** | Required |

#### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | integer | Ticket primary key |

#### Request Body

None.

#### Response `200 OK`

Returns a **Ticket (Detail)** object.

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |
| `404` | Ticket not found or not accessible | `{ "detail": "Not found." }` |

---

### Update Ticket (Full)

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/tickets/{id}/` |
| **Authentication** | Required |

#### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | integer | Ticket primary key |

#### Request Body

All writable fields required:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Non-blank; minimum 5 characters |
| `description` | string | Yes | Non-blank; minimum 10 characters |
| `status` | string | No | Must be a valid workflow transition |
| `priority` | string | No | Valid priority choice |
| `category` | string | No | Valid category choice |
| `assigned_to` | integer \| null | No | User ID of assignee |

Read-only fields (`id`, `ticket_number`, `created_by`, timestamps) are ignored if sent.

#### Response `200 OK`

Returns the updated **Ticket (Detail)** object.

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid status transition | `{ "status": ["Cannot transition from 'open' to 'resolved'."] }` |
| `400` | Validation failure | `{ "title": ["Title must be at least 5 characters long."] }` |
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |
| `404` | Ticket not found or not accessible | `{ "detail": "Not found." }` |

---

### Update Ticket (Partial)

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/api/tickets/{id}/` |
| **Authentication** | Required |

Same as `PUT`, but only include fields to change. Commonly used for status updates:

```json
{
  "status": "in_progress"
}
```

#### Response `200 OK`

Returns the updated **Ticket (Detail)** object.

#### Errors

Same as `PUT`.

#### Status Transition Rules

**Agent / Admin**

| From | Allowed To |
|------|------------|
| `open` | `in_progress`, `closed` |
| `in_progress` | `waiting_on_customer`, `resolved`, `closed` |
| `waiting_on_customer` | `in_progress` |
| `resolved` | `closed`, `reopened` |
| `reopened` | `in_progress` |
| `closed` | `reopened` |

**Customer**

| From | Allowed To |
|------|------------|
| `resolved` | `reopened` |
| `closed` | `reopened` |

Transitioning to `resolved` sets `resolved_at`. Transitioning to `closed` sets `closed_at`. Transitioning to `reopened` clears both.

---

### Delete Ticket

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/tickets/{id}/` |
| **Authentication** | Required |

#### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | integer | Ticket primary key |

#### Request Body

None.

#### Response `204 No Content`

Empty body.

#### Access Rules

| Role | Allowed |
|------|---------|
| Customer | No |
| Agent / Admin | Yes |

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |
| `403` | Customer attempting delete | `{ "detail": "You do not have permission to perform this action." }` |
| `404` | Ticket not found or not accessible | `{ "detail": "Not found." }` |

---

## Comment Endpoints

### List Comments

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/comments/` |
| **Authentication** | Required |

#### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | integer | No | Page number (default: `1`) |
| `ticket` | integer | No | Filter comments by ticket ID |

#### Request Body

None.

#### Response `200 OK`

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "ticket": 1,
      "ticket_number": "TKT-00001",
      "author": { "id": 1, "username": "customer_alice", "email": "alice@example.com" },
      "body": "This issue started after the password reset.",
      "is_internal": false,
      "created_at": "2026-07-28T11:00:00Z"
    }
  ]
}
```

#### Access Rules

| Role | Scope |
|------|-------|
| Customer | Comments on own tickets only; internal comments excluded |
| Agent / Admin | All comments including internal notes |

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |

---

### Create Comment

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/comments/` |
| **Authentication** | Required |

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `ticket` | integer | Yes | Must reference an accessible ticket |
| `body` | string | Yes | Non-blank; minimum 2 characters after trim |
| `is_internal` | boolean | No | Default: `false`; agents/admins only |

```json
{
  "ticket": 1,
  "body": "I have tried clearing my browser cache.",
  "is_internal": false
}
```

`author` is set automatically from the authenticated user.

#### Response `201 Created`

Returns a **Comment** object.

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Missing ticket | `{ "ticket": ["This field is required."] }` |
| `400` | Body too short | `{ "body": ["Comment must be at least 2 characters long."] }` |
| `400` | Customer creating internal comment | `{ "is_internal": ["Only agents can create internal comments."] }` |
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |
| `404` | Ticket not found or not accessible | `{ "detail": "Not found." }` |

---

### Retrieve Comment

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/comments/{id}/` |
| **Authentication** | Required |

#### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | integer | Comment primary key |

#### Request Body

None.

#### Response `200 OK`

Returns a **Comment** object.

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |
| `404` | Comment not found, not accessible, or internal (customer) | `{ "detail": "Not found." }` |

---

### Update Comment (Full)

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/comments/{id}/` |
| **Authentication** | Required |

#### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `body` | string | Yes | Non-blank; minimum 2 characters |
| `is_internal` | boolean | No | Agents/admins only |

`ticket`, `author`, and `created_at` are read-only.

#### Response `200 OK`

Returns the updated **Comment** object.

#### Access Rules

| Role | Allowed |
|------|---------|
| Customer | Own non-internal comments only |
| Agent / Admin | All comments |

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Validation failure | `{ "body": ["Comment body cannot be blank."] }` |
| `400` | Customer setting internal | `{ "is_internal": ["Only agents can mark comments as internal."] }` |
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |
| `404` | Comment not found or not accessible | `{ "detail": "Not found." }` |

---

### Update Comment (Partial)

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/api/comments/{id}/` |
| **Authentication** | Required |

Same as `PUT`, but only include fields to change:

```json
{
  "body": "Updated comment body for this ticket."
}
```

#### Response `200 OK`

Returns the updated **Comment** object.

#### Errors

Same as `PUT`.

---

### Delete Comment

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/comments/{id}/` |
| **Authentication** | Required |

#### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | integer | Comment primary key |

#### Request Body

None.

#### Response `204 No Content`

Empty body.

#### Access Rules

| Role | Allowed |
|------|---------|
| Customer | Own non-internal comments only |
| Agent / Admin | All comments |

#### Errors

| Status | Condition | Example |
|--------|-----------|---------|
| `401` | Not authenticated | `{ "detail": "Authentication credentials were not provided." }` |
| `404` | Comment not found or not accessible | `{ "detail": "Not found." }` |

---

## Endpoint Summary

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| `POST` | `/api/auth/register/` | No | Register a new customer account |
| `POST` | `/api/auth/login/` | No | Log in and receive a token |
| `GET` | `/api/auth/me/` | Yes | Get current user profile |
| `GET` | `/api/tickets/` | Yes | List tickets (paginated, filterable) |
| `POST` | `/api/tickets/` | Yes | Create a ticket |
| `GET` | `/api/tickets/stats/` | Yes | Dashboard statistics |
| `GET` | `/api/tickets/{id}/` | Yes | Retrieve a ticket |
| `PUT` | `/api/tickets/{id}/` | Yes | Full update a ticket |
| `PATCH` | `/api/tickets/{id}/` | Yes | Partial update a ticket |
| `DELETE` | `/api/tickets/{id}/` | Yes | Delete a ticket (agent/admin) |
| `GET` | `/api/comments/` | Yes | List comments (paginated) |
| `POST` | `/api/comments/` | Yes | Create a comment |
| `GET` | `/api/comments/{id}/` | Yes | Retrieve a comment |
| `PUT` | `/api/comments/{id}/` | Yes | Full update a comment |
| `PATCH` | `/api/comments/{id}/` | Yes | Partial update a comment |
| `DELETE` | `/api/comments/{id}/` | Yes | Delete a comment |

---

## Common HTTP Status Codes

| Status | Meaning | When Used |
|--------|---------|-----------|
| `200` | OK | Successful GET, PUT, PATCH, login |
| `201` | Created | Successful POST (register, create ticket, create comment) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation errors, invalid workflow transition |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Authenticated but not permitted (e.g. customer delete ticket) |
| `404` | Not Found | Resource does not exist or is not visible to the user |
| `405` | Method Not Allowed | HTTP method not supported on endpoint |

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | Support Ticket Management System |
| **API Version** | 1.0 (implicit) |
| **Status** | Reflects implemented API |
