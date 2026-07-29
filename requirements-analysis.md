# Requirements Analysis

**Project:** Support Ticket Management System  
**Document Purpose:** Summarize functional and non-functional requirements, assumptions, constraints, and business rules derived from the implemented system.

---

## 1. Functional Requirements

### 1.1 User Authentication & Account Management

| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | The system shall allow new users to register with a username, email, and password. |
| FR-AUTH-02 | The system shall allow registered users to log in with username and password. |
| FR-AUTH-03 | Upon registration or login, the system shall return an authentication token and user profile. |
| FR-AUTH-04 | The system shall provide an endpoint for authenticated users to retrieve their current profile (`id`, `username`, `email`, `role`). |
| FR-AUTH-05 | Newly registered users shall be assigned the **customer** role by default. |
| FR-AUTH-06 | All API endpoints (except registration and login) shall require authentication. |

### 1.2 Role-Based Access Control

| ID | Requirement |
|----|-------------|
| FR-RBAC-01 | The system shall support three application roles: **customer**, **agent**, and **admin**. |
| FR-RBAC-02 | Customers shall only access tickets they created. |
| FR-RBAC-03 | Agents and admins shall access all tickets in the system. |
| FR-RBAC-04 | Customers shall not be permitted to delete tickets. |
| FR-RBAC-05 | Agents and admins shall be permitted to delete tickets. |
| FR-RBAC-06 | Django superusers shall be treated as **admin** for permission checks. |

### 1.3 Ticket Management

| ID | Requirement |
|----|-------------|
| FR-TKT-01 | Authenticated users shall be able to create support tickets with a title, description, category, and priority. |
| FR-TKT-02 | The system shall auto-generate a unique ticket number in the format `TKT-#####`. |
| FR-TKT-03 | New tickets shall default to **open** status, **medium** priority, and **IT Support** category. |
| FR-TKT-04 | Users shall be able to view a paginated list of tickets scoped to their role. |
| FR-TKT-05 | Users shall be able to view full ticket details including status, priority, category, creator, assignee, and timestamps. |
| FR-TKT-06 | Users shall be able to update ticket fields (title, description, category, priority, status) subject to permission and workflow rules. |
| FR-TKT-07 | Tickets shall support assignment to a user via the `assigned_to` field (backend-supported). |
| FR-TKT-08 | The system shall record `resolved_at` when a ticket transitions to **resolved**. |
| FR-TKT-09 | The system shall record `closed_at` when a ticket transitions to **closed**. |
| FR-TKT-10 | Reopening a ticket shall clear `resolved_at` and `closed_at`. |

### 1.4 Ticket Search & Filtering

| ID | Requirement |
|----|-------------|
| FR-FLT-01 | Users shall be able to search tickets by title or description (case-insensitive). |
| FR-FLT-02 | Users shall be able to filter tickets by status, priority, and category. |
| FR-FLT-03 | Filtered and searched results shall respect role-based ticket visibility. |
| FR-FLT-04 | The ticket list shall support pagination (20 items per page). |
| FR-FLT-05 | The frontend shall provide a control to clear all active filters. |

### 1.5 Ticket Status Workflow

| ID | Requirement |
|----|-------------|
| FR-WF-01 | Status changes shall follow a defined workflow; invalid transitions shall be rejected. |
| FR-WF-02 | Agents and admins shall be able to perform operational status transitions (e.g. open → in progress, in progress → resolved). |
| FR-WF-03 | Customers shall only be able to reopen tickets that are **resolved** or **closed**. |
| FR-WF-04 | The frontend shall display only the status actions permitted for the current user and ticket state. |

### 1.6 Comments

| ID | Requirement |
|----|-------------|
| FR-CMT-01 | Authenticated users shall be able to add comments to tickets they can access. |
| FR-CMT-02 | Users shall be able to list comments, optionally filtered by ticket ID. |
| FR-CMT-03 | Agents and admins shall be able to create **internal** comments not visible to customers. |
| FR-CMT-04 | Customers shall not see or create internal comments. |
| FR-CMT-05 | Customers shall be able to update or delete only their own non-internal comments. |
| FR-CMT-06 | Agents and admins shall have full access to all comments on accessible tickets. |

### 1.7 Dashboard

| ID | Requirement |
|----|-------------|
| FR-DSH-01 | Authenticated users shall be able to view a role-specific dashboard. |
| FR-DSH-02 | The dashboard shall display ticket counts grouped by status and priority. |
| FR-DSH-03 | The dashboard shall display the five most recent tickets visible to the user. |
| FR-DSH-04 | Customer dashboards shall highlight active tickets and tickets waiting on the customer. |
| FR-DSH-05 | Agent/admin dashboards shall highlight open pipeline, assigned workload, unassigned tickets, and urgent/high-priority active tickets. |
| FR-DSH-06 | Dashboard metrics shall be scoped to the same ticket visibility rules as the ticket list. |

### 1.8 Administration

| ID | Requirement |
|----|-------------|
| FR-ADM-01 | Tickets, comments, and user profiles shall be manageable via the Django admin interface. |
| FR-ADM-02 | A seed data command shall populate sample users, tickets, and comments for development and testing. |

### 1.9 Frontend Application

| ID | Requirement |
|----|-------------|
| FR-UI-01 | The frontend shall provide pages for login, registration, dashboard, ticket list, ticket detail, ticket creation, and ticket editing. |
| FR-UI-02 | Protected routes shall require authentication; guest routes shall redirect authenticated users. |
| FR-UI-03 | The application shall communicate with the backend via a REST API using token authentication. |

---

## 2. Non-Functional Requirements

### 2.1 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | Passwords shall be stored using Django's built-in password hashing. |
| NFR-SEC-02 | API authentication shall use token-based authentication (DRF authtoken). |
| NFR-SEC-03 | Unauthorized access to another user's ticket shall return **404 Not Found** (not 403), preventing information leakage. |
| NFR-SEC-04 | Registration passwords shall require a minimum length of 8 characters. |
| NFR-SEC-05 | Only agents and admins may create or view internal comments. |

### 2.2 Performance & Scalability

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | Ticket list endpoints shall use database indexes on `status`, `priority`, `category`, and `created_at`. |
| NFR-PERF-02 | Ticket and comment queries shall use `select_related` to reduce database round-trips. |
| NFR-PERF-03 | List endpoints shall be paginated with a default page size of 20 records. |
| NFR-PERF-04 | Dashboard statistics shall be computed in a single API request. |

### 2.3 Usability

| ID | Requirement |
|----|-------------|
| NFR-UX-01 | The frontend shall provide loading, error, and empty states for data-driven views. |
| NFR-UX-02 | Ticket search shall be debounced on the client to limit unnecessary API calls. |
| NFR-UX-03 | Status and priority shall be displayed using color-coded badges for quick recognition. |
| NFR-UX-04 | The UI shall be responsive across desktop and mobile screen sizes. |

### 2.4 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-MNT-01 | Business logic for status transitions shall be centralized in a dedicated workflow service. |
| NFR-MNT-02 | Dashboard aggregation logic shall be separated into a stats service. |
| NFR-MNT-03 | API permissions shall be enforced via dedicated permission classes per resource. |
| NFR-MNT-04 | The backend shall include automated tests for tickets, comments, accounts, workflow, and seed data. |

### 2.5 Compatibility

| ID | Requirement |
|----|-------------|
| NFR-CMP-01 | The backend API shall expose JSON over HTTP following REST conventions. |
| NFR-CMP-02 | The frontend development server shall proxy `/api` requests to the Django backend. |

---

## 3. Assumptions

| ID | Assumption |
|----|------------|
| ASM-01 | Users access the system through a web browser; no native mobile app is required. |
| ASM-02 | A single organization uses the system; multi-tenancy is not required. |
| ASM-03 | Agent and admin roles are assigned manually (via seed data, Django admin, or database), not through self-registration. |
| ASM-04 | Email delivery (notifications, password reset) is out of scope; email is stored for identification only. |
| ASM-05 | SQLite is sufficient for development and demonstration purposes. |
| ASM-06 | All users share a common timezone (UTC) for timestamp display and storage. |
| ASM-07 | Ticket assignment is supported at the data model level; a dedicated assignment UI is not required for core operation. |
| ASM-08 | English is the sole language for labels, messages, and UI text. |
| ASM-09 | Concurrent ticket number generation under heavy load is not a primary concern in the current deployment context. |
| ASM-10 | The Vite development proxy is used for local frontend-to-backend communication; production CORS is not configured in the current setup. |

---

## 4. Constraints

| ID | Constraint |
|----|------------|
| CON-01 | **Technology stack** — Backend must use Django 4.2 and Django REST Framework; frontend must use React with Vite. |
| CON-02 | **Database** — SQLite is the configured database engine. |
| CON-03 | **Authentication** — Token authentication is the primary mechanism for the React frontend; session authentication is available but secondary. |
| CON-04 | **API design** — Endpoints use class-based generic views, not DRF ViewSets. |
| CON-05 | **Ticket statuses** — Limited to six predefined values: open, in_progress, waiting_on_customer, resolved, reopened, closed. |
| CON-06 | **Ticket priorities** — Limited to four predefined values: low, medium, high, urgent. |
| CON-07 | **Ticket categories** — Limited to four predefined values: it_support, access, admin_issue, hr. |
| CON-08 | **Validation** — Ticket titles must be at least 5 characters; descriptions at least 10 characters. |
| CON-09 | **Validation** — Comment bodies must be at least 2 characters. |
| CON-10 | **Pagination** — Fixed at 20 items per page via Django REST Framework settings. |
| CON-11 | **Role model** — Exactly three application roles with a one-to-one user profile extension. |
| CON-12 | **Deployment** — `DEBUG=True` and an insecure default `SECRET_KEY` are configured for development only. |

---

## 5. Key Business Rules

### 5.1 Ticket Lifecycle

| Rule | Description |
|------|-------------|
| BR-TKT-01 | Every ticket is created in **open** status with an auto-generated ticket number. |
| BR-TKT-02 | The ticket creator (`created_by`) is set automatically from the authenticated user and cannot be changed via the create API. |
| BR-TKT-03 | A ticket may only move between statuses defined in the workflow transition map for the user's role. |
| BR-TKT-04 | Setting `resolved_at` and `closed_at` is automatic on status transition; manual timestamp editing is not exposed. |
| BR-TKT-05 | Reopening a ticket clears resolution and closure timestamps. |

### 5.2 Agent Status Transitions

| Current Status | Allowed Next Statuses |
|----------------|----------------------|
| Open | In Progress, Closed |
| In Progress | Waiting on Customer, Resolved, Closed |
| Waiting on Customer | In Progress |
| Resolved | Closed, Reopened |
| Reopened | In Progress |
| Closed | Reopened |

### 5.3 Customer Status Transitions

| Current Status | Allowed Next Status |
|----------------|---------------------|
| Resolved | Reopened |
| Closed | Reopened |

Customers cannot transition tickets through any other status change.

### 5.4 Access Control Rules

| Rule | Description |
|------|-------------|
| BR-ACC-01 | Customers see only tickets where they are the creator. |
| BR-ACC-02 | Agents and admins see all tickets regardless of creator. |
| BR-ACC-03 | Customers cannot delete tickets under any circumstance. |
| BR-ACC-04 | Attempting to access another user's ticket returns 404, not 403. |
| BR-ACC-05 | Superusers are always treated as admin for role-based checks. |

### 5.5 Comment Rules

| Rule | Description |
|------|-------------|
| BR-CMT-01 | Comments are always tied to a specific ticket and an author. |
| BR-CMT-02 | Internal comments (`is_internal=true`) are agent/admin-only for both creation and visibility. |
| BR-CMT-03 | Customers may modify or remove only their own public comments. |
| BR-CMT-04 | Comment threads on a ticket are ordered chronologically (oldest first). |

### 5.6 Dashboard Rules

| Rule | Description |
|------|-------------|
| BR-DSH-01 | **Open pipeline** counts tickets in open, in progress, waiting on customer, or reopened status. |
| BR-DSH-02 | **Unassigned** (agent view) counts active tickets with no assignee. |
| BR-DSH-03 | **Urgent/high** (agent view) counts active tickets with urgent or high priority. |
| BR-DSH-04 | **Needs attention** (customer view) equals the count of tickets in waiting on customer status. |
| BR-DSH-05 | **Active** (customer view) counts open, in progress, waiting on customer, and reopened tickets owned by the customer. |
| BR-DSH-06 | All dashboard counts respect the same role-based ticket scope as the list API. |

### 5.7 Data Integrity Rules

| Rule | Description |
|------|-------------|
| BR-DATA-01 | Ticket numbers are unique and system-generated; users cannot set them manually. |
| BR-DATA-02 | Deleting a user who created tickets is prevented (`PROTECT` on `created_by`). |
| BR-DATA-03 | Deleting a ticket cascades to its comments. |
| BR-DATA-04 | Removing an assigned user sets `assigned_to` to null (`SET_NULL`). |

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | Support Ticket Management System |
| **Source** | Implemented codebase (backend + frontend) |
| **Status** | Reflects current system as built |
