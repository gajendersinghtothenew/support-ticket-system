# Reflection

**Project:** Support Ticket Management System  
**Author:** Gajender Singh  
**Date:** July 29, 2026

---

## What I Learned

Building this project taught me how to design and deliver a complete full-stack application — not just individual features, but an integrated system where the backend, frontend, and documentation work together.

On the **backend**, I learned to structure a Django project into focused apps (`accounts`, `tickets`, `comments`) rather than putting everything in one place. I gained hands-on experience with Django REST Framework serializers, custom permission classes, and token authentication. Writing a dedicated workflow service taught me to keep business rules out of views and serializers, which made the status transition logic testable on its own.

On the **frontend**, I learned how to build a React SPA that consumes a REST API through a centralized client layer. I practiced patterns like React Context for global auth state, route guards for protected pages, and reusable components that serve multiple pages (`TicketForm` for both create and edit). I also learned to handle async UI states properly — loading spinners, error messages with retry, and contextual empty states.

On **full-stack integration**, I learned how token auth flows from login through every API request, how role-based scoping on the backend maps to different UI experiences on the frontend, and how Vite's dev proxy simplifies local development without CORS configuration.

Finally, I learned the value of **documentation as part of the deliverable** — writing requirements, API contracts, acceptance criteria, and test results forced me to think more clearly about what the system actually does versus what I assumed it does.

---

## Challenges

### Status Workflow Complexity

The ticket status workflow was one of the hardest parts. Defining which transitions are allowed for agents versus customers, enforcing those rules at the service layer, surfacing only valid options in the UI, and setting `resolved_at` / `closed_at` timestamps correctly required careful coordination across three layers (service, serializer, frontend). I wrote 12 dedicated workflow tests to make sure I didn't break anything when making changes.

### Role-Based Access Control

Getting permissions right took iteration. I initially considered returning 403 for unauthorized ticket access, but switched to 404 to avoid leaking information about whether a ticket exists. Internal comments added another layer — customers must not see them in list queries, on direct retrieval, or through the create API. Each case needed its own test.

### Frontend–Backend Validation Alignment

Keeping validation rules consistent was tricky. The ticket title needs at least 5 characters on both the client (`TicketForm`) and the server (`TicketCreateSerializer`). When I added client-side validation, I had to verify the rules matched exactly. Comment minimum length (2 characters) and password minimum (8 characters) followed the same pattern.

### Duplicated Workflow Maps

The allowed status transitions exist in `backend/tickets/services/workflow.py` and `frontend/src/utils/constants.js`. I know this is a maintenance risk — if I add a new transition on the backend but forget the frontend, the UI will show wrong options. I documented this as a known gap and noted that an API endpoint for allowed transitions would be the proper fix.

### Search and Filter Integration

Adding search, filters, and pagination to the ticket list required changes on both sides — a `TicketFilter` class with `django-filter` on the backend and a `TicketFilters` component with debounced search on the frontend. I also had to handle URL query parameters so dashboard stat cards could link to pre-filtered views. Getting the page to reset to 1 when filters changed was a small but important UX detail.

### No Frontend Automated Tests

I relied entirely on manual testing for the React UI. Writing 42 backend tests gave me confidence in the API, but I had to walk through every page and role combination manually using the acceptance criteria checklists. This was time-consuming and I know I would have caught more edge cases with Vitest or Playwright.

---

## AI-Assisted Development

I used AI assistance throughout this project, and it significantly accelerated my workflow — but it also required me to stay in control.

**Where AI helped most:**
- **Scaffolding** — generating boilerplate for serializers, views, React components, and CSS that I then reviewed and adjusted
- **Documentation** — drafting README, API contract, requirements analysis, and test strategy documents that I verified against the actual codebase
- **Debugging** — when a view edit accidentally merged `get_serializer_class` into `get_queryset`, AI helped me spot and fix the breakage quickly
- **Exploring patterns** — understanding how `django-filter` integrates with DRF, or how to structure a stats service for the dashboard

**Where I had to lead:**
- **Architecture decisions** — choosing token auth over sessions, splitting into three Django apps, using generic views instead of ViewSets. AI suggested options, but I made the calls based on project scope.
- **Business rules** — the workflow transition map and permission model came from requirements I defined. AI implemented them, but I validated every rule against the acceptance criteria.
- **Review and correction** — I caught cases where AI removed an import (`apiClient` in `tickets.js`) or wrote documentation that didn't match the implementation. I always ran tests and builds after AI-generated changes.

**What I learned about AI-assisted development:**
AI is most effective when I have a clear plan and use it to execute well-defined tasks. It is less reliable when I ask it to make architectural decisions without context, or when I accept generated code without reading it. Treating AI output as a first draft — not a finished product — kept the quality high.

---

## Architecture Decisions

These are the key decisions I made and why I stand by them.

| Decision | Why I chose it |
|----------|----------------|
| **Django REST Framework** | Mature integration with Django models, built-in serializers, permissions, and pagination |
| **Generic class-based views** | Explicit URL routing and per-method customization; easier to read than ViewSets for this project size |
| **Token authentication** | Stateless and straightforward for a React SPA; no CSRF complexity during development |
| **React Context (auth only)** | Right-sized for a single piece of global state; avoided Redux overhead |
| **SQLite** | Zero configuration for development and demonstration; Django ORM makes switching to PostgreSQL straightforward |
| **Service layer for workflow** | Business rules tested independently; views stay thin |
| **Three Django apps** | Clear separation of accounts, tickets, and comments with independent tests |
| **UserProfile extension** | Avoided custom user model migration complexity while supporting roles |
| **404 instead of 403** | Security-conscious access control for user-scoped resources |
| **Co-located CSS** | No framework dependency; full control over styling with BEM-like naming |
| **Vite dev proxy** | Eliminated CORS setup for local development |

The decision I would reconsider first is **duplicating workflow transitions on the frontend**. If I rebuilt this, I would expose allowed transitions from the API and let the frontend render whatever the server returns.

---

## Future Improvements

If I continue developing this project, these are my priorities:

**Production readiness**
- Environment-based settings (`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` from env vars)
- `requirements.txt` with pinned dependencies
- PostgreSQL instead of SQLite
- `django-cors-headers` for production frontend deployment
- DRF throttling on login and register endpoints

**Testing**
- Frontend unit tests with Vitest and React Testing Library
- End-to-end tests with Playwright for critical user journeys
- Pagination and category filter automated tests on the backend

**Features**
- Ticket assignment UI for agents
- API endpoint for allowed status transitions (remove frontend duplication)
- Comment edit and delete in the UI
- Email notifications on status changes
- Ticket history / audit log
- File attachments on tickets

**Code quality**
- Custom hooks (`useTicket`, `useTicketList`, `useUserRole`) to reduce page-level duplication
- Shared validator mixin for ticket title/description on the backend
- CI pipeline (GitHub Actions) running tests on every push
- OpenAPI schema generation with `drf-spectacular`

---

## Lessons Learned

1. **Start with the data model.** Getting the `Ticket`, `Comment`, and `UserProfile` models right early made everything downstream — serializers, permissions, workflow, UI — much easier. Changing the category choices later required a migration.

2. **Test business logic in isolation.** The workflow service tests (`test_workflow.py`) caught transition bugs before they reached the API layer. Service-layer tests are faster to write and run than full HTTP integration tests.

3. **Permissions deserve their own tests.** Every role combination (customer accessing another user's ticket, customer creating internal comments, agent deleting tickets) needed an explicit test. Assuming permissions work is not enough.

4. **Don't skip empty and error states.** Users hit empty lists, failed API calls, and unauthorized access more often than expected. Building `LoadingSpinner`, `ErrorMessage`, and `EmptyState` components early paid off across every page.

5. **Documentation clarifies thinking.** Writing `requirements-analysis.md` and `acceptance-criteria.md` exposed gaps I hadn't noticed — like the lack of pagination tests and the need for URL-driven filters on the ticket list.

6. **Keep the frontend thin.** Pages should orchestrate data fetching and compose components. When `TicketDetailPage` started growing, I extracted `TicketStatusActions`, `TicketMeta`, and `CommentList` to keep it manageable.

7. **Review AI-generated code before committing.** AI accelerated delivery, but I found bugs (broken imports, merged methods, inaccurate docs) every time I skipped a careful read-through. Running `python manage.py test` and `npm run build` after every significant change became my safety net.

8. **Seed data is essential.** The `seed_data` management command made manual testing, demos, and onboarding frictionless. Having realistic data across all statuses and roles saved hours of manual setup.

9. **Security defaults matter even in demos.** Using 404 for unauthorized access, hashing passwords, and blocking internal comments for customers are small decisions that demonstrate professional habits.

10. **Ship incrementally.** The project grew in clear phases — models, API, auth, ticket list, comments, workflow, filters, dashboard — and each phase was testable on its own. Trying to build everything at once would have made debugging much harder.

---

## Closing Thoughts

This project took me from a Django backend with models and APIs to a complete, documented, tested application that a real user could log into and use. The hardest parts were not the CRUD operations — they were the workflow rules, permission boundaries, and keeping the frontend and backend in sync.

I am satisfied with the result as a demonstration of full-stack development skills. The codebase is organized, tested, and documented. The gaps I identified — production hardening, frontend tests, assignment UI — are clear and actionable, which is exactly where I would pick up if this were a production system.

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | Support Ticket Management System |
| **Author** | Gajender Singh |
| **Status** | Complete |
