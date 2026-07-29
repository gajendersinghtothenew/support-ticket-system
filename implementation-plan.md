# Implementation Plan

**Project:** Support Ticket Management System  
**Format:** Chronological implementation timeline  
**Scope:** Reflects the order in which the system was designed and built.

---

## Overview

The Support Ticket Management System was implemented as a decoupled full-stack application: a Django REST API backend and a React single-page frontend. Work progressed from requirements and data modeling through API development, authentication, frontend features, testing, and final documentation polish.

---

## Phase 1 — Planning

**Goal:** Define scope, architecture, and delivery order before writing code.

### Activities
- Defined the core problem: customers submit support requests; agents manage and resolve them.
- Identified three user roles: **customer**, **agent**, and **admin**.
- Chose the technology stack:
  - **Backend:** Django 4.2 + Django REST Framework
  - **Frontend:** React 19 + Vite
  - **Database:** SQLite (development)
  - **Auth:** Token-based authentication
- Designed the application structure as three Django apps:
  - `accounts` — users, profiles, roles
  - `tickets` — ticket lifecycle and workflow
  - `comments` — public and internal ticket comments
- Planned the API as RESTful JSON endpoints using class-based generic views (not ViewSets).
- Mapped frontend pages and routes:
  - Auth: login, register
  - Tickets: list, detail, create, edit
  - Dashboard (deferred until core ticket features were complete)
- Defined ticket attributes: status, priority, category, assignment, and timestamps.
- Documented the status workflow rules for agents and customers before implementation.
- Established coding conventions: service layer for workflow logic, permission classes per resource, co-located CSS per component.

### Deliverables
- Project structure (`backend/`, `frontend/`)
- Domain model design (Ticket, Comment, UserProfile)
- API endpoint map
- Role and permission matrix
- Frontend route plan

---

## Phase 2 — Backend Foundation

**Goal:** Set up the Django project, data models, and admin interface.

### Activities
- Initialized the Django project under `backend/config/`.
- Created Django apps: `accounts`, `tickets`, `comments`.
- Configured `settings.py`:
  - Installed `rest_framework`, `rest_framework.authtoken`, `django_filters`
  - Set default pagination (20 items per page)
  - Configured token and session authentication
- Implemented **Ticket model** (`tickets/models.py`):
  - Status, priority, and category choices
  - Auto-generated `ticket_number` (`TKT-#####`)
  - Foreign keys to `created_by` and `assigned_to`
  - Timestamps: `created_at`, `updated_at`, `resolved_at`, `closed_at`
- Implemented **Comment model** (`comments/models.py`):
  - Foreign keys to ticket and author
  - `is_internal` flag for agent-only notes
- Implemented **UserProfile model** (`accounts/models.py`):
  - One-to-one link to Django `User`
  - Role field: customer, agent, admin
  - Signal to auto-create profile on user registration
- Created and applied database migrations.
- Configured Django admin for tickets, comments, and user profiles with list displays, filters, and inline comments.

### Deliverables
- Database schema and migrations
- Django admin for content management
- Core models with indexes on frequently queried fields

---

## Phase 3 — Authentication

**Goal:** Enable secure user registration, login, and role-aware identity.

### Activities
- Enabled DRF token authentication (`rest_framework.authtoken`).
- Built **accounts serializers**:
  - `RegisterSerializer` — username, email, password (min 8 characters)
  - `LoginSerializer` — credential validation via Django `authenticate()`
  - `UserSerializer` — exposes `id`, `username`, `email`, `role`
- Implemented **auth API views**:
  - `POST /api/auth/register/` — create account, return token
  - `POST /api/auth/login/` — authenticate, return token
  - `GET /api/auth/me/` — return current user profile
- Created **permission helpers** (`accounts/permissions.py`):
  - `get_user_role()` — resolves role from profile or superuser status
  - `is_agent_or_admin()` — shared check for staff-level access
- Wrote **accounts tests** for registration, login, and profile retrieval.

### Deliverables
- Token-based auth API
- Role attached to every authenticated user response
- Default customer role for self-registered users

---

## Phase 4 — APIs

**Goal:** Expose full ticket and comment functionality through REST endpoints.

### 4.1 Ticket API

- Implemented serializers:
  - `TicketListSerializer` — lightweight list view
  - `TicketSerializer` — full detail with workflow integration on update
  - `TicketCreateSerializer` — customer ticket creation
- Built views:
  - `GET/POST /api/tickets/` — list and create
  - `GET/PATCH/DELETE /api/tickets/{id}/` — retrieve, update, delete
- Implemented **TicketPermission**:
  - Customers: own tickets only; no delete
  - Agents/admins: all tickets; full CRUD
  - Unauthorized access returns 404 (not 403)
- Implemented **status workflow service** (`tickets/services/workflow.py`):
  - `AGENT_TRANSITIONS` and `CUSTOMER_TRANSITIONS` maps
  - `transition()` with validation and timestamp updates
  - `WorkflowError` for invalid transitions
- Integrated workflow into `TicketSerializer.update()` — status changes via PATCH.

### 4.2 Comment API

- Implemented `CommentSerializer` and `CommentCreateSerializer`.
- Built views:
  - `GET/POST /api/comments/` — list (with `?ticket=<id>` filter) and create
  - `GET/PATCH/DELETE /api/comments/{id}/` — detail operations
- Implemented **CommentPermission**:
  - Customers: own tickets only; no internal comments
  - Agents/admins: full access including internal notes

### 4.3 Search, Filters & Stats

- Added **TicketFilter** (`tickets/filters.py`):
  - `search` — title and description (case-insensitive)
  - `status`, `priority`, `category` — exact-match filters
- Wired `DjangoFilterBackend` into `TicketListCreateView`.
- Implemented **stats service** (`tickets/services/stats.py`):
  - Role-scoped counts by status and priority
  - Customer metrics: active, needs attention
  - Agent metrics: assigned to me, unassigned, urgent/high
- Added `GET /api/tickets/stats/` for dashboard data.

### 4.4 Seed Data

- Created `python manage.py seed_data` management command:
  - 3 customers, 2 agents, 1 admin
  - 6 tickets across all statuses
  - 13 comments (public and internal)
  - Default password: `password123`

### Deliverables
- Complete REST API for tickets and comments
- Workflow-enforced status transitions
- Search, filter, pagination, and stats endpoints
- Development seed data command

---

## Phase 5 — Frontend

**Goal:** Build the React SPA and connect it to the backend API.

### 5.1 Foundation

- Scaffolded React app with Vite.
- Configured Vite dev proxy: `/api` → `http://127.0.0.1:8000`.
- Built **API client** (`api/client.js`):
  - Token storage in `localStorage`
  - `apiClient()` wrapper with auth headers and error handling
- Created **AuthContext** for session management and bootstrap via `/api/auth/me/`.
- Implemented route guards:
  - `ProtectedRoute` — redirects unauthenticated users to login
  - `GuestRoute` — redirects authenticated users away from auth pages
- Built **AppLayout** with navbar: Dashboard, Tickets, Create Ticket, profile dropdown, logout.

### 5.2 Authentication UI

- Built `LoginForm` and `RegisterForm` with validation and error display.
- Created `LoginPage` and `RegisterPage`.
- Wired auth flows to `AuthContext` with redirect to `/tickets` on success.

### 5.3 Ticket Features

| Step | Feature | Key Files |
|------|---------|-----------|
| 1 | Ticket List | `TicketListPage`, `TicketCard`, status/priority badges |
| 2 | Ticket Detail | `TicketDetailPage`, `TicketMeta` |
| 3 | Create Ticket | `CreateTicketPage`, `TicketForm` |
| 4 | Edit Ticket | `EditTicketPage`, `TicketForm` (edit mode) |
| 5 | Comments | `CommentList`, `CommentItem`, `CommentForm` |
| 6 | Status Workflow | `TicketStatusActions`, success `Notification` |
| 7 | Search & Filters | `TicketFilters`, debounced search, clear filters |
| 8 | Pagination | Previous/Next controls, page reset on filter change |
| 9 | Dashboard | `DashboardPage`, `StatCard`, `StatusBreakdown`, role-specific views |

### 5.4 Shared UI

- Reusable components: `LoadingSpinner`, `ErrorMessage`, `EmptyState`, `Badge`, `Notification`.
- Utility modules: `constants.js` (statuses, priorities, workflow maps), `errors.js`, `formatters.js`.
- Responsive CSS with BEM-like naming, co-located per component.

### Deliverables
- Fully functional React SPA
- All ticket and comment flows connected to the API
- Role-aware dashboard with stats integration
- Responsive, consistent UI across all pages

---

## Phase 6 — Testing

**Goal:** Verify correctness of business logic, permissions, and API contracts.

### Activities
- **Accounts tests** — registration, login, profile, role assignment.
- **Ticket API tests** — CRUD, role-based list scoping, delete restrictions, 404 on unauthorized access.
- **Workflow tests** (`test_workflow.py`) — valid and invalid agent/customer transitions, timestamp side effects.
- **Filter tests** — search by title, filter by status and priority.
- **Stats tests** — customer vs agent response shape and scoping.
- **Comment tests** — creation, internal note visibility, permission boundaries.
- **Seed data tests** — verify seed command creates expected records.

### Test Execution

```bash
cd backend
python manage.py test
```

**Result:** 42 tests passing across all apps.

### Deliverables
- Automated test suite covering models, permissions, workflow, APIs, and seed data
- Confidence in role-based access control and status transition rules

---

## Phase 7 — Final Polish

**Goal:** Documentation, developer experience, and submission readiness.

### Activities
- Wrote **README.md**:
  - Project overview, features, tech stack
  - Installation and setup instructions
  - API reference with query parameters
  - Default test users and future improvements
- Wrote **candidate-info.md** — submission metadata.
- Wrote **requirements-analysis.md**:
  - Functional and non-functional requirements
  - Assumptions, constraints, and business rules
- Wrote **acceptance-criteria.md** — QA checklists for every feature.
- Wrote **implementation-plan.md** — this document.
- Verified frontend production build (`npm run build`).
- Confirmed end-to-end flows with seed data users.

### Deliverables
- Complete project documentation suite
- Reproducible local setup via README
- QA-ready acceptance criteria checklists

---

## Implementation Timeline Summary

```
Phase 1  Planning              → Scope, roles, architecture, route map
Phase 2  Backend Foundation    → Models, migrations, admin
Phase 3  Authentication        → Token auth, roles, user API
Phase 4  APIs                  → Tickets, comments, workflow, filters, stats, seed data
Phase 5  Frontend              → Auth UI → tickets → comments → workflow → search/filters → dashboard
Phase 6  Testing               → 42 automated backend tests
Phase 7  Final Polish          → README, requirements, acceptance criteria, submission docs
```

---

## Dependency Graph

The phases above follow strict dependencies:

1. **Backend models** must exist before APIs.
2. **Authentication** must exist before protected endpoints.
3. **Ticket API** must exist before comments (comments reference tickets).
4. **Workflow service** must exist before status changes are exposed.
5. **Core ticket API** must exist before search, filters, and stats.
6. **API client and auth context** must exist before any frontend feature pages.
7. **Ticket list and detail** must exist before create, edit, comments, and workflow UI.
8. **Search and filters** must exist before dashboard deep-links to filtered views.
9. **All features** must be complete before acceptance criteria and final documentation.

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | Support Ticket Management System |
| **Author** | Gajender Singh |
| **Status** | Implementation complete |
