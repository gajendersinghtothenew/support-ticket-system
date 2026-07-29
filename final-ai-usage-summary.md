# Final AI Usage Summary

**Project:** Support Ticket Management System  
**Author:** Gajender Singh  
**Date:** July 29, 2026

---

## Overview

AI tools (Cursor AI) were used throughout the development of this project as an assistive technology — not as an autonomous developer. AI helped accelerate planning, design exploration, code generation, debugging, and documentation drafting. **Every piece of AI-generated output was reviewed, tested, and refined by me before being accepted into the codebase.**

No code, configuration, or documentation was committed without manual verification. Backend changes were validated with `python manage.py test` (42 tests). Frontend changes were verified with `npm run build` and manual QA against `acceptance-criteria.md`.

---

## How AI Was Used

| Phase | AI Role | My Role |
|-------|---------|---------|
| Planning | Suggested architecture, app structure, and feature phasing | Defined scope, roles, workflow rules, and delivery order |
| Design | Proposed UI patterns, component structure, and API shapes | Chose final stack, patterns, and trade-offs |
| Implementation | Generated boilerplate for models, views, serializers, components, and CSS | Reviewed, edited, integrated, and tested all code |
| Debugging | Identified root causes and suggested fixes | Verified fixes, re-ran tests, confirmed behavior |
| Testing | Drafted test cases and identified coverage gaps | Wrote and ran tests, validated results |
| Documentation | Drafted all project documentation files | Reviewed for accuracy against the actual codebase |

---

## Planning

AI assisted with initial project planning by:

- Recommending a decoupled architecture (Django REST API + React SPA)
- Suggesting a three-app backend structure (`accounts`, `tickets`, `comments`)
- Proposing a phased delivery order: models → API → auth → frontend pages → filters → dashboard
- Identifying role-based access requirements (customer, agent, admin)
- Mapping frontend routes and page hierarchy

**My contribution:** I defined the business requirements — ticket statuses, workflow transitions, permission rules, and feature scope. I decided to defer the dashboard until core ticket features were complete, and chose generic class-based views over ViewSets. The implementation plan (`implementation-plan.md`) and requirements analysis (`requirements-analysis.md`) were AI-drafted and then reviewed by me for accuracy.

---

## Design

AI assisted with design decisions by:

- Explaining trade-offs between token auth and session auth for SPAs
- Recommending React Context over Redux for auth-only global state
- Suggesting a service layer pattern for workflow and stats logic
- Proposing component breakdown for the frontend (common, layout, tickets, comments, dashboard)
- Drafting the data model with relationships, indexes, and delete behaviors

**My contribution:** I made the final architecture decisions documented in `design-notes.md` — including 404 instead of 403 for unauthorized access, SQLite for development, co-located CSS without a framework, and Vite dev proxy instead of CORS. I reviewed the entity relationship design and adjusted category choices to match the project domain (IT Support, Access, Admin Issue, HR).

---

## Implementation

AI generated significant portions of the implementation code, which I reviewed and refined before acceptance.

### Backend (AI-assisted)

| Component | AI Generated | I Reviewed / Modified |
|-----------|-------------|----------------------|
| Django models (`Ticket`, `Comment`, `UserProfile`) | Initial structure | Adjusted fields, indexes, choices |
| Serializers | CRUD serializers with validation | Verified validation rules match requirements |
| Permission classes | `TicketPermission`, `CommentPermission` | Confirmed 404 behavior and role rules |
| Workflow service | `AGENT_TRANSITIONS`, `CUSTOMER_TRANSITIONS`, `transition()` | Validated every transition against business rules |
| Views and URLs | Generic API views, URL routing | Fixed a broken `get_serializer_class` merge |
| `TicketFilter` + django-filter | Search and filter backend | Verified query param behavior |
| Stats service + endpoint | Dashboard aggregation logic | Confirmed role-scoped response shapes |
| Seed data command | Sample users, tickets, comments | Tested with `--clear` flag |
| Tests | Test cases for API, workflow, comments | Ran full suite — 42 tests passing |

### Frontend (AI-assisted)

| Component | AI Generated | I Reviewed / Modified |
|-----------|-------------|----------------------|
| API client + auth module | `apiClient`, token storage, `ApiError` | Fixed missing import in `tickets.js` |
| `AuthContext` | Session bootstrap, login/register/logout | Verified token persistence on reload |
| Route guards | `ProtectedRoute`, `GuestRoute` | Tested redirect behavior |
| Ticket pages | List, detail, create, edit | Verified role-based behavior manually |
| `TicketForm` | Create/edit mode with client validation | Confirmed rules match API |
| `TicketFilters` | Search, filters, clear button | Tested debounce and URL params |
| `DashboardPage` | Role-specific stat cards and breakdown | Verified against stats API |
| Comments UI | `CommentList`, `CommentForm`, internal notes | Tested customer vs agent visibility |
| `TicketStatusActions` | Workflow UI with quick actions | Verified transitions match backend |
| CSS | Component styles, responsive breakpoints | Checked on desktop and mobile |

### Review Process for Code

For every AI-generated code change, I followed this process:

1. **Read** the generated diff carefully — not just accept blindly
2. **Run** `python manage.py test` after backend changes
3. **Run** `npm run build` after frontend changes
4. **Test manually** critical flows (login, create ticket, status change, comments)
5. **Fix** any issues found before moving to the next task

Examples of issues I caught during review:
- `get_serializer_class` accidentally merged into `get_queryset` in `tickets/views.py`
- Missing `import { apiClient }` in `api/tickets.js` after an edit
- Documentation describing features not yet implemented (corrected before submission)

---

## Debugging

AI assisted with debugging by:

- Diagnosing a broken `get_queryset` / `get_serializer_class` merge in `tickets/views.py`
- Identifying missing imports after file edits
- Explaining DRF permission behavior (404 vs 403)
- Suggesting fixes for failed backend test edits

**My contribution:** I ran the tests and builds to confirm fixes worked. When AI suggested a fix, I verified it against the actual error output rather than applying it blindly. For example, when backend view edits failed partially, I read the file directly to understand the current state before applying corrections.

---

## Testing

AI assisted with testing by:

- Drafting test cases for new features (filters, stats, workflow)
- Identifying coverage gaps (pagination, category filter, frontend tests)
- Generating `test-strategy.md` and `test-results.md` from actual test run output
- Suggesting test organization patterns (`APIRequestFactory` vs `APITestCase`)

**My contribution:** I ran the full test suite after every significant change:

```
Ran 42 tests in ~18s
OK
```

I verified test results were real by executing `python manage.py test --verbosity=2` and capturing the output for `test-results.md`. I performed manual QA for all frontend flows using seed data users and the checklists in `acceptance-criteria.md`. I documented known gaps (no pagination test, no frontend automation) honestly in the test strategy.

---

## Documentation

AI generated all project documentation files. Each was reviewed for accuracy against the implemented codebase.

| Document | AI Role | My Review |
|----------|---------|-----------|
| `README.md` | Drafted setup, API overview, test users | Verified commands and endpoints work |
| `candidate-info.md` | Submission metadata | Confirmed details are correct |
| `requirements-analysis.md` | Functional/non-functional requirements | Checked against actual implementation |
| `acceptance-criteria.md` | QA checklists per feature | Walked through each item manually |
| `implementation-plan.md` | Chronological build timeline | Verified phase order matches git history |
| `design-notes.md` | Architecture decision rationale | Confirmed decisions match code |
| `api-contract.md` | Full API reference | Cross-checked with serializers and views |
| `data-model.md` | Database schema documentation | Verified against models and migrations |
| `ui-flow.md` | Page navigation and user journeys | Tested flows in the browser |
| `test-strategy.md` | Testing approach and gaps | Confirmed against actual test files |
| `test-results.md` | Test run summary | Generated from real `manage.py test` output |
| `code-review-notes.md` | Self-review findings | Honest assessment of strengths and gaps |
| `review-fixes.md` | Post-review improvements | Documented actual fixes made |
| `pr-description.md` | Pull request description | Verified feature list and checklist |
| `reflection.md` | Personal reflection | Written from genuine project experience |

Documentation was not generated speculatively — each file describes what was actually built, tested, and verified.

---

## Statement of Responsibility

I confirm that:

- **All code in this repository was reviewed by me** before acceptance, regardless of whether it was AI-generated or written manually.
- **All backend code was validated** with the automated test suite (42 tests, all passing).
- **All frontend code was validated** with production builds and manual QA.
- **All documentation was verified** against the actual implementation — not generated from assumptions.
- **Architecture and business decisions were made by me** — AI provided options and implementations, but I chose the direction.
- **Known gaps are documented honestly** in `code-review-notes.md`, `test-strategy.md`, and `reflection.md` — including missing frontend tests, no `requirements.txt`, and production hardening needs.

AI accelerated my development workflow significantly, but **I remain fully responsible for the quality, correctness, and completeness of this submission.**

---

## AI Usage by the Numbers

| Metric | Value |
|--------|-------|
| Documentation files AI-assisted | 15 |
| Backend test files | 5 (42 tests) |
| Frontend automated tests | 0 (manual QA) |
| Backend apps | 3 |
| API endpoints | 16 |
| Frontend pages | 7 |
| Git commits | 9 |
| Lines changed (approx.) | ~5,900 additions |

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | Support Ticket Management System |
| **Author** | Gajender Singh |
| **AI Tool** | Cursor AI |
| **Status** | Final submission |
