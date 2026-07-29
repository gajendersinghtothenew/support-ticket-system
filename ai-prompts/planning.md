# Planning

**Project:** Support Ticket Management System  
**Author:** Gajender Singh  
**Planning Tool:** Cursor AI (assisted)  
**Approach:** Explain → decide → implement → verify, one scope at a time

This document summarizes the planning prompts used throughout the project and the key decisions made at each stage. Every major feature followed the same pattern: **request an explanation first, finalize decisions, then generate code for a single focused scope.**

---

## Planning Philosophy

| Principle | How It Was Applied |
|-----------|-------------------|
| **No code before understanding** | Early prompts explicitly said "Don't generate code yet" |
| **One scope per step** | Each prompt limited scope (e.g. "only the Ticket model", "don't generate views yet") |
| **Explain before implement** | Design decisions documented in AI responses before code generation |
| **Incremental delivery** | Backend completed before frontend; core pages before dashboard |
| **Verify after each step** | Migrations, tests, and manual checks before moving on |

---

## Phase 1 — Requirements & Discovery

### Planning Prompt

> *I am starting a new project called Support Ticket Management System. I'm using Django REST Framework for the backend, React for the frontend, and SQLite as the database. Before writing any code, I want to understand the project properly. Can you help me break down the requirements? Please explain: what features I need to build, what business rules I should keep in mind, any edge cases I should think about, anything that might be easy to miss. Don't generate code yet.*

### Key Decisions

| Decision | Outcome |
|----------|---------|
| Core users | **Customer** (creates tickets) and **Agent** (handles queue); **Admin** optional |
| MVP scope | Auth, tickets, comments, status workflow, role-based access |
| Ticket lifecycle | Open → In Progress → Waiting on Customer → Resolved → Closed, with reopen |
| Communication | Comment threads on tickets; internal notes for agents |
| Edge cases identified | Permission boundaries, status transition rules, pagination, empty states |

---

## Phase 2 — Architecture Design

### Planning Prompt

> *The requirements and business rules look good. Let's move on to the architecture. Please help me design the application before we start coding. Tech stack: Django, DRF, React (Vite), SQLite. I want the architecture to be clean, modular, and easy to maintain. Please explain: high-level architecture, backend folder structure, frontend folder structure, database relationships, API request flow, where validation should happen, where business logic should live, how ticket status workflow should be implemented, how authentication and permissions should be organized, how the project should scale. Don't generate code yet.*

### Follow-Up Prompt

> *Use of this module relationship?* — Clarified how Django apps depend on each other vs how database entities relate.

### Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Architecture | Decoupled SPA + REST API | Independent frontend/backend development |
| Backend apps | `accounts`, `tickets`, `comments` | Domain separation |
| Business logic | **Service layer** (not model or view) | Testable workflow rules |
| Validation | **Serializers** at API boundary | Consistent input/output shaping |
| API style | Class-based generic views | Explicit URLs; not ViewSets |
| Auth | Token-based for React SPA | Stateless; avoids CSRF in dev |
| Frontend state | React Context for auth only | Right-sized; no Redux |
| Scaling | Add apps/features without restructuring | Modular from day one |

---

## Phase 3 — Data Model Design

### Ticket Model Prompt

> *Let's start implementing the Ticket model. Based on the project requirements we finalized earlier, explain which fields the Ticket model should contain and why. Explain the purpose of every field before generating the Django model. After generating: explain relationships, field types, validations to add later. Focus only on the Ticket model. Don't generate serializers, views, or APIs yet.*

### Comment Model Prompt

> *Now I'd like to implement the Comment model. Before generating any code, explain: what fields, how it relates to Ticket, whether comments link to users, what happens on ticket delete, whether timestamps are needed, validations and best practices. Then generate the model. Focus only on the Comment model.*

### Follow-Up Prompts

| Prompt | Decision |
|--------|----------|
| *Why multiple classes inside Ticket?* | `TextChoices` for status, priority, category — Django pattern for enums |
| *Add category: IT Support, Access, Admin Issue, HR* | Updated `Category` choices; migration `0002_alter_ticket_category` |
| *Migrate Ticket / Comment fields* | Applied migrations; verified with `showmigrations` |

### Key Decisions

| Model | Decision |
|-------|----------|
| **Ticket** | `ticket_number` auto-generated; `created_by` PROTECT; `assigned_to` SET_NULL; `resolved_at`/`closed_at` for workflow |
| **Comment** | CASCADE delete with ticket; `is_internal` for agent-only notes; `author` PROTECT |
| **UserProfile** | One-to-one with Django User; role field (customer/agent/admin); auto-created via signal |
| **Indexes** | On status, priority, category, created_at; composite indexes for queue queries |

---

## Phase 4 — Backend API Layer

### Planning Prompts (in order)

| # | Prompt Summary | Scope Limit |
|---|----------------|-------------|
| 1 | Configure Django Admin — explain list views, search, filters, read-only fields | Admin only |
| 2 | Implement DRF serializers with validation and read-only fields | Serializers only |
| 3 | Design API layer — endpoints, HTTP methods, APIView vs ViewSet trade-offs | Design only |
| 4 | Implement Ticket API (list, retrieve, create, update, delete) | Ticket API only |
| 5 | Implement Comment API | Comment API only |
| 6 | Configure URL routing (app-level + project-level) | URLs only |
| 7 | Implement authentication and permissions | Auth/permissions only |
| 8 | Design and implement ticket workflow — transitions, where logic lives, testing | Workflow only |
| 9 | Create seed data for development and testing | Seed command only |

### Key Decisions

| Area | Decision |
|------|----------|
| Serializers | `TicketListSerializer`, `TicketSerializer`, `TicketCreateSerializer` — separate per action |
| Endpoints | `/api/auth/`, `/api/tickets/`, `/api/comments/` with RESTful verbs |
| View pattern | `ListCreateAPIView`, `RetrieveUpdateDestroyAPIView`, `APIView` |
| Permissions | `TicketPermission`, `CommentPermission`; 404 for unauthorized ticket access |
| Workflow | `tickets/services/workflow.py` with `AGENT_TRANSITIONS` and `CUSTOMER_TRANSITIONS` |
| Customer transitions | Reopen only from resolved/closed |
| Seed data | 6 users, 6 tickets (all statuses), 13 comments; `password123` default |

---

## Phase 5 — Frontend Planning & Foundation

### Frontend Architecture Prompt

> *The Django backend is complete. Now I'd like to start the React frontend. Before generating any code, explain: overall frontend architecture, how the app should be organized, which pages are needed, reusable components, how to communicate with APIs, how auth should be handled, React best practices. Recommend a folder structure. Don't generate React code yet.*

### Foundation Prompt

> *Now start implementing. Generate only: Vite proxy, API client, AuthContext, basic routing, App.jsx and main.jsx. Don't generate Login, Ticket pages, or components yet.*

### Follow-Up Question

> *If I'm already logged in to Django, will that session work automatically in React?*  
> **Decision:** No — React uses token auth in `localStorage`, separate from Django session/admin login.

### Key Decisions

| Area | Decision |
|------|----------|
| Pages | Login, Register, Dashboard, Ticket List, Detail, Create, Edit |
| API layer | `api/client.js` + domain modules (`auth.js`, `tickets.js`, `comments.js`) |
| Auth | `AuthContext` with bootstrap via `/api/auth/me/` |
| Routes | `ProtectedRoute`, `GuestRoute`, `AppLayout` with Navbar |
| Dev proxy | Vite proxies `/api` → `localhost:8000` |

---

## Phase 6 — Frontend Feature Implementation

### Planning Prompts (in order)

| # | Feature Prompt | Explicit Exclusions |
|---|----------------|---------------------|
| 1 | Login + Register pages and forms | No ticket pages or layout |
| 2 | Ticket List page with cards, badges, loading/error/empty states | No detail, create, or comments |
| 3 | Navbar + AppLayout with logout | — |
| 4 | Ticket Detail page with metadata display | No comments, status actions, or edit |
| 5 | Create Ticket page with form | — |
| 6 | Edit Ticket page (reuse TicketForm) | — |
| 7 | Comments (list, form, internal notes) | — |
| 8 | Ticket status workflow UI | — |

### Key Decisions

| Feature | Decision |
|---------|----------|
| Ticket list | `TicketCard` with status/priority badges; role-scoped via API |
| Layout | Sticky Navbar with profile dropdown, role badge, mobile hamburger |
| Ticket form | Single `TicketForm` with `mode="create"` / `mode="edit"` |
| Comments | `CommentForm` hides internal checkbox for customers |
| Workflow UI | `TicketStatusActions` mirrors backend transition maps |
| States | Shared `LoadingSpinner`, `ErrorMessage`, `EmptyState` |

---

## Phase 7 — Search, Filters & Dashboard

### Ticket List Enhancement Prompt

> *Improve the Ticket List page with search and filtering. Generate: search by title/description, filter by status/priority/category, clear filters, pagination, API integration. Keep UI clean and responsive. Don't implement dashboard yet.*

### Dashboard Prompt

> *Can you design dashboard?* — Implemented role-specific dashboard with stats API.

### Key Decisions

| Area | Decision |
|------|----------|
| Search | `django-filter` + `TicketFilter`; debounced 300ms on frontend |
| Pagination | DRF page size 20; Previous/Next controls |
| Stats API | `GET /api/tickets/stats/` — single request for dashboard |
| Dashboard | Customer vs agent/admin views with different stat cards |
| URL params | Dashboard links → `/tickets?status=open` etc. |

---

## Phase 8 — Documentation & Submission

### Planning Prompts (submission package)

| Document | Prompt |
|----------|--------|
| `README.md` | Professional README with setup, API, test users |
| `candidate-info.md` | Candidate name, project, tech stack, submission date |
| `requirements-analysis.md` | Functional/non-functional requirements, assumptions, constraints |
| `acceptance-criteria.md` | Checklist for every implemented feature |
| `implementation-plan.md` | Chronological implementation timeline |
| `design-notes.md` | Why DRF, React, SQLite, token auth, etc. |
| `api-contract.md` | Every endpoint with request/response/errors |
| `data-model.md` | Database design and business rules |
| `ui-flow.md` | Page navigation and user journeys |
| `test-strategy.md` | Backend, manual, workflow, API testing approach |
| `test-results.md` | 42/42 tests passing summary |
| `code-review-notes.md` | Self-review strengths and gaps |
| `review-fixes.md` | Post-review improvements applied |
| `pr-description.md` | Pull request description |
| `reflection.md` | Personal reflection on the project |
| `final-ai-usage-summary.md` | How AI assisted development |
| `planning.md` | This document |

---

## Key Decisions Summary

### Technology

| Choice | Alternative Considered | Why Chosen |
|--------|------------------------|------------|
| Django 4.2 + DRF | Flask, FastAPI | Mature ORM, admin, auth integration |
| React + Vite | CRA, Next.js | Fast dev experience; SPA fit |
| SQLite | PostgreSQL | Zero-config for dev/demo |
| Token auth | JWT, session cookies | Simple; works with SPA proxy |
| Generic API views | ViewSets + routers | Explicit, readable URL config |
| django-filter | Manual query params | Declarative, testable filters |

### Architecture

| Choice | Why |
|--------|-----|
| Three Django apps | Clear domain boundaries |
| Service layer for workflow | Testable business rules |
| UserProfile extension | Avoid custom user model complexity |
| 404 for unauthorized tickets | Security — no information leakage |
| Separate list/detail serializers | Smaller payloads on list endpoints |
| React Context (auth only) | No Redux needed for scope |

### Delivery Order

```
Requirements → Architecture → Models → Admin → Serializers
    → API Design → Ticket API → Comment API → URLs
    → Auth & Permissions → Workflow → Seed Data → Tests
    → Frontend Plan → Foundation → Auth UI → Ticket List
    → Layout → Detail → Create → Edit → Comments → Workflow UI
    → Search & Filters → Dashboard → Documentation
```

### Deferred Items (consciously planned out of scope)

| Item | When |
|------|------|
| Dashboard | After core ticket features (Phase 7) |
| Search/filters | After basic ticket list (Phase 7) |
| Ticket assignment UI | Future — model supports it |
| Email notifications | Future |
| Production deployment config | Future |
| Frontend automated tests | Future |

---

## Prompt Pattern Used Throughout

Nearly every implementation prompt followed this template:

```
[Context: what is already complete]

Now I'd like to implement [FEATURE].

[Optional: explain design decisions before code]

Generate implementation for:
- [specific deliverable 1]
- [specific deliverable 2]
- ...

Let's focus only on [SCOPE].
Don't implement [EXPLICIT EXCLUSIONS] yet.
```

This pattern kept each step reviewable, testable, and independent — and prevented scope creep across backend and frontend layers.

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | Support Ticket Management System |
| **Author** | Gajender Singh |
| **Planning Sessions** | Jul 21 – Jul 29, 2026 |
| **Total Git Commits** | 9 feature commits |
| **Status** | Planning complete; project delivered |
