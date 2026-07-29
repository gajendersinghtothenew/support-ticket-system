# Test Strategy

**Project:** Support Ticket Management System  
**Current automated coverage:** 42 backend tests (Django test runner)  
**Frontend automated tests:** Not implemented

This document describes the testing approach used in the project — what is automated today, what is verified manually, and how each area of the application should be tested.

---

## Testing Philosophy

| Principle | Application |
|-----------|-------------|
| **Test business logic at the lowest appropriate layer** | Workflow rules tested in `test_workflow.py` before API integration |
| **Test permissions at the API boundary** | Role-based access verified through HTTP-level tests |
| **Use realistic data** | Seed data command provides repeatable manual and integration scenarios |
| **Fail fast on regressions** | Run `python manage.py test` before every commit |
| **Document what is not automated** | Frontend UI flows rely on manual QA using `acceptance-criteria.md` |

---

## Backend Testing

### Framework & Tools

| Tool | Purpose |
|------|---------|
| `django.test.TestCase` | Database transactions rolled back after each test |
| `rest_framework.test.APITestCase` | HTTP client for auth endpoint tests |
| `rest_framework.test.APIRequestFactory` | Lightweight view-level tests without URL routing |
| `rest_framework.test.force_authenticate` | Simulate authenticated requests |

### Test Organization

| File | Tests | Focus |
|------|-------|-------|
| `backend/accounts/tests.py` | 4 | Registration, login, profile |
| `backend/tickets/tests.py` | 16 | Ticket CRUD, filters, stats, permissions |
| `backend/tickets/test_workflow.py` | 10 | Status transition service |
| `backend/tickets/test_seed_data.py` | 2 | Seed management command |
| `backend/comments/tests.py` | 10 | Comment CRUD, internal notes, permissions |

### Running Backend Tests

```bash
cd backend
source ../venv/bin/activate
python manage.py test                  # all 42 tests
python manage.py test accounts         # auth only
python manage.py test tickets          # tickets + workflow + seed
python manage.py test comments         # comments only
python manage.py test tickets.test_workflow  # workflow service only
```

### Backend Test Patterns

**1. View-level tests with `APIRequestFactory`**

Used for tickets and comments. Views are called directly without URL resolution:

```python
request = self.factory.get("/api/tickets/")
force_authenticate(request, user=self.user)
response = TicketListCreateView.as_view()(request)
self.assertEqual(response.status_code, status.HTTP_200_OK)
```

**2. Integration tests with `APITestCase`**

Used for accounts. Full HTTP round-trip through URL routing:

```python
response = self.client.post(reverse("accounts:register"), {...}, format="json")
self.assertEqual(response.status_code, status.HTTP_201_CREATED)
```

**3. Service-layer unit tests**

Workflow logic tested independently of serializers and views:

```python
with self.assertRaises(WorkflowError):
    transition(self.ticket, Ticket.Status.IN_PROGRESS, self.customer)
```

**4. Management command tests**

Seed data verified via `call_command`:

```python
call_command("seed_data", stdout=StringIO())
self.assertGreaterEqual(Ticket.objects.count(), 6)
```

### Test Data Setup

Each test class uses a `setUp()` method that creates isolated users and tickets:

```python
def create_user(username, role=UserProfile.Role.CUSTOMER):
    user = User.objects.create_user(username=username, ...)
    user.profile.role = role
    user.profile.save(update_fields=["role"])
    return user
```

No shared state between tests — Django wraps each test in a transaction that is rolled back.

---

## Frontend Testing

### Current State

No automated frontend tests are implemented. There are no Jest, Vitest, or React Testing Library test files in `frontend/`.

### Recommended Approach (Future)

| Layer | Tool | What to Test |
|-------|------|--------------|
| Unit | Vitest + React Testing Library | Individual components (`StatCard`, `TicketFilters`, `CommentForm`) |
| Integration | React Testing Library + MSW | Page flows with mocked API responses |
| E2E | Playwright or Cypress | Full user journeys across login → create → comment |

### Priority Components for Future Unit Tests

| Component | Key Behaviors |
|-----------|---------------|
| `TicketFilters` | Filter change callbacks, clear filters visibility |
| `TicketStatusActions` | Allowed transitions rendered per role |
| `CommentForm` | Internal checkbox hidden for customers |
| `AuthContext` | Login/logout/bootstrap session lifecycle |
| `ProtectedRoute` | Redirect when unauthenticated |

### Manual Frontend Verification

Until automated frontend tests are added, UI behavior is verified manually using the checklists in `acceptance-criteria.md` and the flows described in `ui-flow.md`.

---

## Manual Testing

### Purpose

Manual testing validates end-to-end user experience, visual layout, responsive behavior, and interactions that automated API tests do not cover.

### Prerequisites

```bash
# Terminal 1 — Backend
cd backend && source ../venv/bin/activate
python manage.py migrate
python manage.py seed_data
python manage.py runserver

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open `http://localhost:5173`.

### Manual Test Matrix

| Area | Customer (`customer_alice`) | Agent (`agent_sarah`) |
|------|----------------------------|----------------------|
| Login / logout | ✓ | ✓ |
| Register new account | ✓ | — |
| View ticket list (scoped) | Own tickets only | All tickets |
| Search and filter | ✓ | ✓ |
| Pagination | ✓ | ✓ |
| Create ticket | ✓ | ✓ |
| View ticket detail | ✓ | ✓ |
| Edit ticket | ✓ | ✓ |
| Post comment | ✓ | ✓ |
| Internal comment | Hidden | Visible + creatable |
| Status workflow | Reopen only | Full transitions |
| Dashboard | Customer metrics | Agent metrics |
| Responsive layout | Mobile + desktop | Mobile + desktop |

**Password for all seed users:** `password123`

### Manual Test Procedure

1. Walk through each page listed in `ui-flow.md`.
2. Verify each checkbox in `acceptance-criteria.md`.
3. Test on at least two viewport widths (desktop ≥1024px, mobile ≤480px).
4. Test with at least two roles (customer and agent).
5. Record any failures with steps to reproduce.

---

## Authentication Testing

### Automated Tests

| Test | File | Verifies |
|------|------|----------|
| `test_register_returns_token_and_user` | `accounts/tests.py` | Registration returns token + user with `customer` role |
| `test_login_returns_token` | `accounts/tests.py` | Valid credentials return token |
| `test_me_requires_authentication` | `accounts/tests.py` | `GET /api/auth/me/` returns 401 without token |
| `test_me_returns_current_user` | `accounts/tests.py` | Authenticated user profile returned |
| `test_list_tickets_requires_authentication` | `tickets/tests.py` | Ticket list returns 401 without token |
| `test_list_comments_requires_authentication` | `comments/tests.py` | Comment list returns 401 without token |

### Scenarios to Test

| Scenario | Expected Result | Covered By |
|----------|-----------------|------------|
| Register with valid data | 201 + token + role `customer` | Automated |
| Register with duplicate username | 400 validation error | Manual |
| Register with password < 8 chars | 400 validation error | Manual |
| Login with valid credentials | 200 + token | Automated |
| Login with wrong password | 400 "Invalid username or password." | Manual |
| Access protected endpoint without token | 401 | Automated |
| Access protected endpoint with valid token | 200 | Automated |
| Page reload with stored token | Session restored via `/api/auth/me/` | Manual |
| Logout | Token cleared; redirect to login | Manual |
| Guest visits `/login` while authenticated | Redirect to `/tickets` | Manual |

### Token Verification

```bash
# Register and capture token
curl -s -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"customer_alice","password":"password123"}'

# Use token on protected endpoint
curl -s http://127.0.0.1:8000/api/auth/me/ \
  -H "Authorization: Token <token>"
```

---

## Workflow Testing

### Service-Layer Tests (`test_workflow.py`)

Workflow logic is tested independently from the API to ensure business rules are correct at the source.

| Test | Verifies |
|------|----------|
| `test_open_ticket_can_move_to_in_progress` | Agent can start work on open ticket |
| `test_open_ticket_cannot_move_directly_to_resolved` | Skipping in_progress is blocked |
| `test_closed_ticket_cannot_move_directly_to_in_progress` | Must reopen first |
| `test_agent_transition_sets_resolved_timestamp` | `resolved_at` set on resolve |
| `test_agent_transition_sets_closed_timestamp` | `closed_at` set on close |
| `test_reopen_clears_resolution_timestamps` | `resolved_at` and `closed_at` cleared |
| `test_customer_can_reopen_resolved_ticket` | Customer reopen path works |
| `test_customer_cannot_move_open_ticket_to_in_progress` | `WorkflowError` raised |
| `test_customer_allowed_transitions_are_limited` | Only reopen from resolved/closed |
| `test_waiting_on_customer_can_return_to_in_progress` | Agent can resume work |

### API-Layer Workflow Tests (`tickets/tests.py`)

| Test | Verifies |
|------|----------|
| `test_invalid_status_transition_returns_400` | API rejects illegal transition with field error |
| `test_valid_status_transition_updates_ticket` | PATCH with valid status persists change |

### Manual Workflow Test Matrix

Test each transition from the ticket detail page UI:

**Agent (`agent_sarah`)**

| From | To | Expected |
|------|----|----------|
| Open | In Progress | Success notification |
| Open | Closed | Success |
| In Progress | Waiting on Customer | Success |
| In Progress | Resolved | Success; `resolved_at` set |
| In Progress | Closed | Success |
| Waiting on Customer | In Progress | Success |
| Resolved | Closed | Success |
| Resolved | Reopened | Success; timestamps cleared |
| Closed | Reopened | Success |
| Open | Resolved | Error — invalid transition |

**Customer (`customer_alice`)**

| From | To | Expected |
|------|----|----------|
| Resolved | Reopened | Success |
| Closed | Reopened | Success |
| Open | In Progress | No action available / error |
| Any other | Any other | No action available |

---

## API Testing

### Endpoint Coverage Matrix

| Endpoint | Method | Automated | Manual |
|----------|--------|-----------|--------|
| `/api/auth/register/` | POST | ✓ | ✓ |
| `/api/auth/login/` | POST | ✓ | ✓ |
| `/api/auth/me/` | GET | ✓ | ✓ |
| `/api/tickets/` | GET | ✓ | ✓ |
| `/api/tickets/` | POST | ✓ | ✓ |
| `/api/tickets/stats/` | GET | ✓ | ✓ |
| `/api/tickets/{id}/` | GET | ✓ | ✓ |
| `/api/tickets/{id}/` | PATCH | ✓ | ✓ |
| `/api/tickets/{id}/` | PUT | — | ✓ |
| `/api/tickets/{id}/` | DELETE | ✓ | ✓ |
| `/api/comments/` | GET | ✓ | ✓ |
| `/api/comments/` | POST | ✓ | ✓ |
| `/api/comments/{id}/` | GET | ✓ | ✓ |
| `/api/comments/{id}/` | PATCH | ✓ | ✓ |
| `/api/comments/{id}/` | DELETE | ✓ | ✓ |

### Permission Tests (Automated)

| Test | Role | Verifies |
|------|------|----------|
| `test_list_tickets_returns_only_own_tickets_for_customer` | Customer | List scoped to creator |
| `test_agent_can_list_all_tickets` | Agent | Sees all tickets |
| `test_customer_cannot_retrieve_other_users_ticket` | Customer | 404 on other user's ticket |
| `test_customer_cannot_delete_ticket` | Customer | 403 on delete |
| `test_agent_can_delete_ticket` | Agent | 204 on delete |
| `test_customer_cannot_see_internal_comments` | Customer | Internal comments excluded |
| `test_agent_can_see_internal_comments` | Agent | Internal comments included |
| `test_customer_cannot_comment_on_other_users_ticket` | Customer | 404 on comment create |
| `test_customer_cannot_create_internal_comment` | Customer | 400 on internal flag |
| `test_customer_cannot_retrieve_internal_comment` | Customer | 404 on internal comment GET |
| `test_ticket_stats_for_customer` | Customer | Stats without agent fields |
| `test_ticket_stats_for_agent` | Agent | Stats with agent fields |

### Filter & Search Tests (Automated)

| Test | Verifies |
|------|----------|
| `test_filter_tickets_by_status` | `?status=in_progress` returns matching tickets |
| `test_search_tickets_by_title` | `?search=email` matches title |
| `test_filter_tickets_by_priority` | `?priority=high` returns matching tickets |

### Manual API Testing with curl

```bash
TOKEN="<auth-token>"

# List with filters
curl -s "http://127.0.0.1:8000/api/tickets/?status=open&search=vpn" \
  -H "Authorization: Token $TOKEN"

# Dashboard stats
curl -s "http://127.0.0.1:8000/api/tickets/stats/" \
  -H "Authorization: Token $TOKEN"

# Status transition
curl -s -X PATCH "http://127.0.0.1:8000/api/tickets/1/" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

### DRF Browsable API

During development, endpoints can be explored interactively at `http://127.0.0.1:8000/api/` when logged in via session authentication in the browser.

---

## Edge Cases

### Access Control Edge Cases

| Scenario | Expected Behavior | Test Type |
|----------|-------------------|-----------|
| Customer accesses another user's ticket by ID | 404 Not Found | Automated |
| Customer deletes own ticket | 403 Forbidden | Automated |
| Customer views internal comment by direct ID | 404 Not Found | Automated |
| Customer comments on another user's ticket | 404 Not Found | Automated |
| Agent deletes any ticket | 204 No Content | Automated |
| Unauthenticated request to any endpoint | 401 Unauthorized | Automated |
| Superuser login | Treated as admin role | Manual |

### Workflow Edge Cases

| Scenario | Expected Behavior | Test Type |
|----------|-------------------|-----------|
| Transition to same status (no-op) | Allowed; no error | Service layer |
| Agent skips in_progress → resolved directly from open | 400 rejected | Automated |
| Customer tries in_progress from open | WorkflowError / 400 | Automated |
| Reopen clears resolved_at and closed_at | Both set to null | Automated |
| Closed → in_progress (without reopen) | Blocked | Automated |

### Data Edge Cases

| Scenario | Expected Behavior | Test Type |
|----------|-------------------|-----------|
| Empty ticket list for new customer | Empty state in UI | Manual |
| No matching search results | "No matching tickets" empty state | Manual |
| Ticket with no assignee | Displays "Unassigned" on card | Manual |
| Ticket with no comments | Empty comment thread | Manual |
| Pagination on last page | Next button disabled | Manual |
| Pagination on first page | Previous button disabled | Manual |
| Filter + search combined | Both applied (AND logic) | Manual |
| Dashboard with zero tickets | Empty recent tickets state | Manual |
| Register then immediate ticket create | created_by set correctly | Manual |

### Concurrency & Limits

| Scenario | Expected Behavior | Test Type |
|----------|-------------------|-----------|
| Ticket number uniqueness | Auto-generated `TKT-#####` unique | Manual |
| Page size exceeds 20 tickets | Pagination splits results | Manual |
| Very long title (200 chars) | Accepted at model max | Manual |
| Title with only whitespace | Rejected after strip | Validation |

---

## Validation Testing

### Backend Validation (Serializer-Level)

Validation is enforced in serializers and tested through API requests that expect `400` responses.

#### User Registration

| Field | Rule | Error Message |
|-------|------|---------------|
| `username` | Required, non-blank after trim | "Username cannot be blank." |
| `username` | Unique | "A user with that username already exists." |
| `password` | Minimum 8 characters | "Ensure this field has at least 8 characters." |

#### Ticket Create / Update

| Field | Rule | Error Message |
|-------|------|---------------|
| `title` | Required, non-blank | "Title cannot be blank." |
| `title` | Minimum 5 characters | "Title must be at least 5 characters long." |
| `description` | Required, non-blank | "Description cannot be blank." |
| `description` | Minimum 10 characters | "Description must be at least 10 characters long." |
| `status` | Valid workflow transition | "Cannot transition from 'X' to 'Y'." |
| `category` | Valid choice | "\"invalid\" is not a valid choice." |
| `priority` | Valid choice | "\"invalid\" is not a valid choice." |

#### Comment Create / Update

| Field | Rule | Error Message |
|-------|------|---------------|
| `body` | Required, non-blank | "Comment body cannot be blank." |
| `body` | Minimum 2 characters | "Comment must be at least 2 characters long." |
| `is_internal` | Agents/admins only | "Only agents can create internal comments." |
| `ticket` | Required on create | "This field is required." |

### Frontend Validation (Client-Side)

| Form | Client Validation | Server Fallback |
|------|-------------------|-----------------|
| Login | HTML `required` on fields | API 400 on invalid credentials |
| Register | `required`, `minLength={8}` on password | API 400 on short password |
| Comment form | Minimum 2 characters before submit | API 400 on short body |
| Ticket form | No client-side length checks | API 400 on short title/description |
| Status actions | Must select a status | Local error if empty selection |

### Validation Test Procedure

For each field rule above:

1. **Automated (where covered):** Submit invalid data via API test; assert `400` and error message in response body.
2. **Manual:** Submit invalid data through the UI form; verify error is displayed to the user.
3. **Boundary:** Test exactly at the minimum length (e.g. 5-char title, 10-char description, 2-char comment) — should succeed.
4. **Below boundary:** Test one character below minimum — should fail.

### Validation Coverage Gaps

| Gap | Recommendation |
|-----|----------------|
| No automated test for short title/description on create | Add `test_create_ticket_title_too_short` |
| No automated test for duplicate username message | Add to `accounts/tests.py` |
| No frontend unit tests for form validation | Add Vitest tests for `CommentForm`, `TicketForm` |
| PUT (full update) not automated | Add test or document as manual-only |

---

## Test Coverage Summary

| Area | Automated | Manual | Notes |
|------|-----------|--------|-------|
| Authentication | 6 tests | ✓ | Register, login, me, 401 guards |
| Ticket CRUD | 8 tests | ✓ | Create, read, update, delete permissions |
| Ticket filters/search | 3 tests | ✓ | Status, priority, search |
| Ticket stats | 2 tests | ✓ | Customer vs agent response shape |
| Workflow service | 10 tests | ✓ | All transition rules and timestamps |
| Workflow API | 2 tests | ✓ | 400 on invalid, 200 on valid |
| Comments | 10 tests | ✓ | CRUD, internal notes, permissions |
| Seed data | 2 tests | — | Command output verification |
| Frontend UI | — | ✓ | acceptance-criteria.md checklists |
| Responsive layout | — | ✓ | Manual viewport testing |
| **Total automated** | **42 tests** | | `python manage.py test` |

---

## CI Recommendation (Future)

```yaml
# Example GitHub Actions step
- name: Run backend tests
  run: |
    cd backend
    python manage.py test --verbosity=2
```

Add frontend tests to CI once Vitest/Playwright is introduced.

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | Support Ticket Management System |
| **Automated Tests** | 42 (backend only) |
| **Related Docs** | `acceptance-criteria.md`, `api-contract.md`, `ui-flow.md` |
| **Status** | Reflects current test suite |
