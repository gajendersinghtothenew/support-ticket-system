# Design Notes

**Project:** Support Ticket Management System  
**Purpose:** Document the architectural decisions made during development and the reasoning behind them.

---

## 1. Why Django REST Framework?

Django REST Framework (DRF) was chosen as the API layer on top of Django because it provides a mature, well-documented toolkit for building JSON APIs without reinventing common patterns.

### Reasons

| Factor | Decision |
|--------|----------|
| **Integration with Django** | DRF works natively with Django models, ORM, admin, and auth — no impedance mismatch between the data layer and the API layer. |
| **Serializers** | Input validation, output shaping, and nested relationships (e.g. `created_by` on tickets) are handled declaratively through serializers rather than manual JSON construction. |
| **Permissions** | Custom permission classes (`TicketPermission`, `CommentPermission`) integrate cleanly with views and enforce role-based access at the API boundary. |
| **Pagination & filtering** | Built-in `PageNumberPagination` and `django-filter` integration reduced boilerplate for the ticket list endpoint. |
| **Authentication** | DRF ships with token and session authentication backends, making it straightforward to secure endpoints. |
| **Testability** | `APIRequestFactory` and `force_authenticate` allow fast, isolated API tests without a running HTTP server. |

### Design choice: Generic views over ViewSets

The project uses **class-based generic views** (`ListCreateAPIView`, `RetrieveUpdateDestroyAPIView`, `APIView`) rather than DRF ViewSets and routers.

**Why:**
- Each endpoint has explicit, readable URL patterns in `urls.py`.
- Views can customize behavior per HTTP method without router magic.
- Permission and serializer switching per method is clearer (e.g. `TicketCreateSerializer` on POST, `TicketListSerializer` on GET).
- Easier for reviewers and new contributors to trace request → view → serializer → model.

---

## 2. Why React?

React was chosen for the frontend because the application is a dynamic, multi-page experience with frequent state changes — ticket lists, filters, forms, comment threads, and status workflows all require responsive UI updates without full page reloads.

### Reasons

| Factor | Decision |
|--------|----------|
| **Component model** | UI maps naturally to components: `TicketCard`, `TicketForm`, `CommentList`, `StatCard`. Each encapsulates its own markup and styles. |
| **Ecosystem** | React Router handles protected routes, nested layouts, and URL-driven navigation. |
| **State-driven UI** | Ticket status, filters, and auth state drive what the user sees; React's declarative rendering fits this model well. |
| **Separation from backend** | React consumes the REST API as a pure client, keeping frontend and backend independently developable and testable. |
| **Industry adoption** | React is widely used, well-documented, and familiar to most frontend developers. |

### Design choice: Vite over Create React App

**Vite** was used as the build tool for fast dev server startup, hot module replacement, and a simple proxy configuration (`/api` → Django backend). No additional state management library (Redux, Zustand) was introduced — the application's state needs are modest enough for React Context and local component state.

---

## 3. Why SQLite?

SQLite is the default database for this project.

### Reasons

| Factor | Decision |
|--------|----------|
| **Zero configuration** | No separate database server process to install, configure, or manage. The database file (`db.sqlite3`) is created automatically on first migration. |
| **Portability** | A single file can be copied, reset, or deleted for development. Ideal for demos, coursework, and local testing. |
| **Sufficient for scope** | The expected data volume (users, tickets, comments) is well within SQLite's capabilities for a single-organization help desk. |
| **Django compatibility** | Django supports SQLite out of the box with no additional drivers or settings. |
| **Fast iteration** | Developers can reset the database (`rm db.sqlite3 && migrate && seed_data`) in seconds. |

### Trade-off acknowledged

SQLite is not recommended for high-concurrency production deployments. The architecture allows swapping to PostgreSQL by changing the `DATABASES` setting — no application code changes required because Django's ORM abstracts the database layer.

---

## 4. Why Token Authentication?

Token authentication was chosen as the primary mechanism for the React frontend.

### Reasons

| Factor | Decision |
|--------|----------|
| **Stateless API requests** | The React SPA runs on a different origin/port than Django. Each API request carries an `Authorization: Token <key>` header — no cookies or session state required on the server between requests. |
| **Simple implementation** | DRF's built-in `TokenAuthentication` and `rest_framework.authtoken` require minimal configuration. Tokens are issued on login/register and stored client-side. |
| **Explicit auth boundary** | The `apiClient` wrapper attaches the token to every request. Unauthenticated requests fail clearly with 401. |
| **Frontend session bootstrap** | On page load, `AuthContext` reads the stored token, calls `GET /api/auth/me/`, and restores the session — or clears invalid tokens. |

### Why not session/cookie auth for the SPA?

Session authentication relies on cookies and CSRF protection, which adds complexity when the frontend and backend run on different ports during development. Token auth avoids CSRF concerns for API calls and is the standard pattern for SPAs consuming REST APIs.

Session authentication remains configured as a secondary option (useful for Django admin and browsable API during development).

### Security considerations

- Tokens are stored in `localStorage` — acceptable for this project's scope; production systems may prefer `httpOnly` cookies or short-lived JWTs with refresh tokens.
- Passwords are hashed via Django's built-in `create_user()` — never stored in plain text.

---

## 5. Why React Context?

React Context (`AuthContext`) manages global authentication state rather than prop-drilling user and token through every component.

### Reasons

| Factor | Decision |
|--------|----------|
| **Global auth state** | User identity and token are needed across the app: navbar, protected routes, comment forms (internal note checkbox), status actions (role-based transitions), and dashboard (role-specific layout). |
| **Avoid prop drilling** | Passing `user` and `token` through 4–5 component layers would be verbose and error-prone. Context provides a single source of truth. |
| **Session lifecycle** | `AuthProvider` handles login, register, logout, and bootstrap-on-mount in one place. Components call `useAuth()` without knowing how tokens are stored or validated. |
| **Right-sized abstraction** | The app has one piece of truly global state (auth). Context is sufficient; Redux or Zustand would add dependency and boilerplate without clear benefit. |

### What Context is not used for

Ticket lists, filters, comments, and dashboard stats use **local component state** (`useState`) and **API calls** — they don't need to be shared globally. This keeps Context focused on auth only.

---

## 6. Why Reusable Components?

The frontend is built from small, focused components rather than monolithic page files.

### Component categories

| Category | Examples | Purpose |
|----------|----------|---------|
| **Common** | `LoadingSpinner`, `ErrorMessage`, `EmptyState`, `Badge`, `Notification` | Consistent loading, error, and empty states across all pages |
| **Layout** | `Navbar`, `AppLayout` | Shared navigation and page shell |
| **Tickets** | `TicketCard`, `TicketForm`, `TicketStatusBadge`, `TicketFilters`, `TicketStatusActions` | Ticket-specific UI reused across list, detail, create, and edit |
| **Comments** | `CommentList`, `CommentItem`, `CommentForm` | Comment thread on the detail page |
| **Dashboard** | `StatCard`, `StatusBreakdown` | Metric cards and charts on the dashboard |

### Reasons

| Factor | Decision |
|--------|----------|
| **DRY principle** | `TicketForm` serves both create and edit modes. `TicketCard` appears on the list page and dashboard. One implementation, multiple uses. |
| **Consistent UX** | Shared `LoadingSpinner` and `ErrorMessage` ensure every page handles async states the same way. |
| **Easier maintenance** | Changing badge colors or card styling in one file updates every occurrence. |
| **Testability** | Small components with clear props are easier to reason about and test in isolation. |
| **Readable pages** | Page components (`TicketListPage`, `DashboardPage`) orchestrate data fetching and compose child components — they stay focused on layout and flow, not markup details. |

### Styling convention

Each component has a co-located CSS file (e.g. `TicketCard.jsx` + `TicketCard.css`) using BEM-like class names. No CSS framework was added — custom styles keep the bundle small and give full control over the design.

---

## 7. Why REST APIs?

The backend exposes a **RESTful JSON API** rather than GraphQL, gRPC, or server-rendered Django templates.

### Reasons

| Factor | Decision |
|--------|----------|
| **Decoupled architecture** | The React frontend and Django backend are independent applications communicating over HTTP. Either can be replaced or scaled without affecting the other. |
| **Standard conventions** | REST uses familiar HTTP verbs (GET, POST, PATCH, DELETE) and status codes (200, 201, 400, 401, 404). Developers and tools understand this pattern immediately. |
| **Resource-oriented URLs** | `/api/tickets/`, `/api/tickets/{id}/`, `/api/comments/?ticket={id}` map directly to domain resources. URLs are predictable and self-documenting. |
| **Pagination & filtering via query params** | `?page=2&status=open&search=email` follows REST conventions — no custom query language needed. |
| **Tooling support** | REST APIs can be tested with curl, Postman, or DRF's browsable API. No special client libraries required. |
| **Future clients** | A mobile app, CLI tool, or third-party integration can consume the same API without backend changes. |

### API design principles followed

- **Nouns, not verbs** — `/api/tickets/` not `/api/getTickets/`
- **HTTP verbs express intent** — GET to read, POST to create, PATCH to update, DELETE to remove
- **Consistent response shapes** — paginated lists return `{ count, next, previous, results }`
- **Errors as JSON** — validation errors return field-level detail in the response body

---

## 8. Additional Architectural Decisions

### 8.1 Service Layer for Business Logic

Status transitions are handled by `tickets/services/workflow.py`, not inline in views or serializers.

**Why:** Workflow rules (which transitions are allowed per role) are complex business logic. Isolating them in a service:
- Keeps views and serializers thin
- Makes rules testable independently (`test_workflow.py`)
- Allows the same logic to be reused if a management command or signal needs it later

Similarly, dashboard aggregation lives in `tickets/services/stats.py`.

### 8.2 Permission Classes per Resource

Each resource has its own permission class rather than a single global permission check.

**Why:**
- `TicketPermission` and `CommentPermission` encode different rules (e.g. customers can't delete tickets but can delete their own comments).
- Permissions are declarative on the view — easy to audit.
- DRF calls `has_permission` and `has_object_permission` automatically.

### 8.3 Return 404 Instead of 403 for Unauthorized Ticket Access

When a customer requests another user's ticket, the API returns **404 Not Found** rather than **403 Forbidden**.

**Why:** A 403 confirms the resource exists but access is denied — leaking information. A 404 treats unauthorized tickets as non-existent, which is a common security pattern for multi-tenant or user-scoped resources.

### 8.4 Three Django Apps

The backend is split into `accounts`, `tickets`, and `comments` rather than a single monolithic app.

**Why:**
- **Separation of concerns** — auth, ticket lifecycle, and commenting are distinct domains.
- **Independent testing** — each app has its own `tests.py`.
- **Scalability** — apps can be extracted, extended, or replaced independently.

### 8.5 UserProfile Extension Model

Roles are stored in a `UserProfile` model (one-to-one with Django `User`) rather than extending the User model directly.

**Why:**
- Avoids custom user model migration complexity.
- Django's built-in `User` model remains intact (admin, auth, third-party packages).
- A signal auto-creates the profile on user registration — no manual profile creation needed.

### 8.6 Vite Dev Proxy

During development, the Vite server proxies `/api` requests to Django at `localhost:8000`.

**Why:**
- Avoids CORS configuration during local development.
- The frontend uses relative URLs (`/api/tickets/`) — same code works in dev and production.
- No `django-cors-headers` dependency required for the development workflow.

### 8.7 Seed Data Management Command

Sample data is loaded via `python manage.py seed_data` rather than fixtures or manual admin entry.

**Why:**
- Repeatable — any developer can reset and reload demo data with one command.
- `--clear` flag removes old seed data before re-creating.
- Tests verify the seed command produces expected records.

### 8.8 No Real-Time Updates

The application uses request/response polling (fetch on page load and after actions), not WebSockets or Server-Sent Events.

**Why:** Ticket updates are not latency-critical for this use case. Adding WebSockets would increase infrastructure complexity without a clear user benefit at this stage. The architecture can add a WebSocket layer later without changing the REST API.

---

## 9. Decision Summary

| Area | Choice | Primary Reason |
|------|--------|----------------|
| API framework | Django REST Framework | Mature Django integration, serializers, permissions |
| View pattern | Generic class-based views | Explicit URLs, per-method customization |
| Frontend | React + Vite | Component model, fast dev experience, SPA fit |
| State management | React Context (auth only) + local state | Right-sized for scope; no Redux needed |
| Database | SQLite | Zero-config, portable, sufficient for dev/demo |
| Authentication | Token (DRF authtoken) | Stateless SPA-friendly auth |
| API style | REST (JSON over HTTP) | Standard, decoupled, tool-friendly |
| Business logic | Service layer (workflow, stats) | Testable, reusable, thin views |
| Access control | Per-resource permission classes | Declarative, auditable, role-aware |
| UI components | Small reusable components | DRY, consistent UX, maintainable |
| Styling | Co-located CSS, no framework | Lightweight, full design control |
| Dev proxy | Vite → Django | No CORS setup needed locally |

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | Support Ticket Management System |
| **Author** | Gajender Singh |
| **Status** | Reflects implemented architecture |
