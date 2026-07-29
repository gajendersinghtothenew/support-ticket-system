# Test Results

**Project:** Support Ticket Management System  
**Test Run Date:** July 29, 2026  
**Command:** `python manage.py test`  
**Environment:** Django 4.2, SQLite (in-memory test database)

---

## Overall Result

| Metric | Value |
|--------|-------|
| **Total Tests** | 42 |
| **Passed** | 42 |
| **Failed** | 0 |
| **Errors** | 0 |
| **Skipped** | 0 |
| **Result** | **PASS** |
| **Duration** | ~18 seconds |
| **Frontend Tests** | None (manual QA only) |

---

## Results by Category

### Authentication

| # | Test Name | File | Status |
|---|-----------|------|--------|
| 1 | `test_register_returns_token_and_user` | `accounts/tests.py` | Pass |
| 2 | `test_login_returns_token` | `accounts/tests.py` | Pass |
| 3 | `test_me_requires_authentication` | `accounts/tests.py` | Pass |
| 4 | `test_me_returns_current_user` | `accounts/tests.py` | Pass |
| 5 | `test_list_tickets_requires_authentication` | `tickets/tests.py` | Pass |
| 6 | `test_list_comments_requires_authentication` | `comments/tests.py` | Pass |

| Summary | Value |
|---------|-------|
| **Tests** | 6 |
| **Passed** | 6 |
| **Failed** | 0 |
| **Result** | **PASS** |

---

### CRUD (Tickets)

| # | Test Name | Operation | Status |
|---|-----------|-----------|--------|
| 1 | `test_create_ticket` | Create | Pass |
| 2 | `test_retrieve_ticket` | Read | Pass |
| 3 | `test_update_ticket` | Update | Pass |
| 4 | `test_agent_can_delete_ticket` | Delete (agent) | Pass |
| 5 | `test_customer_cannot_delete_ticket` | Delete (customer denied) | Pass |
| 6 | `test_customer_cannot_retrieve_other_users_ticket` | Read (access denied) | Pass |
| 7 | `test_list_tickets_returns_only_own_tickets_for_customer` | List (customer scope) | Pass |
| 8 | `test_agent_can_list_all_tickets` | List (agent scope) | Pass |
| 9 | `test_ticket_stats_for_customer` | Stats (customer) | Pass |
| 10 | `test_ticket_stats_for_agent` | Stats (agent) | Pass |

| Summary | Value |
|---------|-------|
| **Tests** | 10 |
| **Passed** | 10 |
| **Failed** | 0 |
| **Result** | **PASS** |

---

### Comments

| # | Test Name | Operation | Status |
|---|-----------|-----------|--------|
| 1 | `test_create_comment` | Create | Pass |
| 2 | `test_retrieve_comment` | Read | Pass |
| 3 | `test_update_comment` | Update | Pass |
| 4 | `test_delete_comment` | Delete | Pass |
| 5 | `test_customer_cannot_see_internal_comments` | List (internal hidden) | Pass |
| 6 | `test_agent_can_see_internal_comments` | List (internal visible) | Pass |
| 7 | `test_customer_cannot_create_internal_comment` | Create (internal denied) | Pass |
| 8 | `test_customer_cannot_retrieve_internal_comment` | Read (internal denied) | Pass |
| 9 | `test_customer_cannot_comment_on_other_users_ticket` | Create (access denied) | Pass |

| Summary | Value |
|---------|-------|
| **Tests** | 9 |
| **Passed** | 9 |
| **Failed** | 0 |
| **Result** | **PASS** |

> Auth guard for comments (`test_list_comments_requires_authentication`) is counted under **Authentication**.

---

### Workflow

| # | Test Name | Layer | Status |
|---|-----------|-------|--------|
| 1 | `test_open_ticket_can_move_to_in_progress` | Service | Pass |
| 2 | `test_open_ticket_cannot_move_directly_to_resolved` | Service | Pass |
| 3 | `test_closed_ticket_cannot_move_directly_to_in_progress` | Service | Pass |
| 4 | `test_agent_transition_sets_resolved_timestamp` | Service | Pass |
| 5 | `test_agent_transition_sets_closed_timestamp` | Service | Pass |
| 6 | `test_reopen_clears_resolution_timestamps` | Service | Pass |
| 7 | `test_customer_can_reopen_resolved_ticket` | Service | Pass |
| 8 | `test_customer_cannot_move_open_ticket_to_in_progress` | Service | Pass |
| 9 | `test_customer_allowed_transitions_are_limited` | Service | Pass |
| 10 | `test_waiting_on_customer_can_return_to_in_progress` | Service | Pass |
| 11 | `test_invalid_status_transition_returns_400` | API | Pass |
| 12 | `test_valid_status_transition_updates_ticket` | API | Pass |

| Summary | Value |
|---------|-------|
| **Tests** | 12 |
| **Passed** | 12 |
| **Failed** | 0 |
| **Result** | **PASS** |

---

### Search

| # | Test Name | Query Param | Status |
|---|-----------|-------------|--------|
| 1 | `test_search_tickets_by_title` | `?search=email` | Pass |

| Summary | Value |
|---------|-------|
| **Tests** | 1 |
| **Passed** | 1 |
| **Failed** | 0 |
| **Result** | **PASS** |

---

### Filters

| # | Test Name | Query Param | Status |
|---|-----------|-------------|--------|
| 1 | `test_filter_tickets_by_status` | `?status=in_progress` | Pass |
| 2 | `test_filter_tickets_by_priority` | `?priority=high` | Pass |

| Summary | Value |
|---------|-------|
| **Tests** | 2 |
| **Passed** | 2 |
| **Failed** | 0 |
| **Result** | **PASS** |

---

### Pagination

| # | Test Name | Status | Notes |
|---|-----------|--------|-------|
| — | *No dedicated automated test* | — | Pagination configured at 20 items/page via DRF settings; verified manually |

| Summary | Value |
|---------|-------|
| **Automated Tests** | 0 |
| **Manual Verification** | Required |
| **Result** | **Not automated** |

---

## Additional Tests (Seed Data)

| # | Test Name | File | Status |
|---|-----------|------|--------|
| 1 | `test_seed_data_creates_sample_records` | `tickets/test_seed_data.py` | Pass |
| 2 | `test_seed_data_clear_recreates_records` | `tickets/test_seed_data.py` | Pass |

| Summary | Value |
|---------|-------|
| **Tests** | 2 |
| **Passed** | 2 |
| **Failed** | 0 |
| **Result** | **PASS** |

---

## Category Summary

| Category | Tests | Passed | Failed | Result |
|----------|-------|--------|--------|--------|
| Authentication | 6 | 6 | 0 | **PASS** |
| CRUD (Tickets) | 10 | 10 | 0 | **PASS** |
| Comments | 9 | 9 | 0 | **PASS** |
| Workflow | 12 | 12 | 0 | **PASS** |
| Search | 1 | 1 | 0 | **PASS** |
| Filters | 2 | 2 | 0 | **PASS** |
| Pagination | 0 | — | — | **Not automated** |
| Seed Data | 2 | 2 | 0 | **PASS** |
| **Total** | **42** | **42** | **0** | **PASS** |

---

## Results by App

| App | Test File(s) | Tests | Passed | Failed | Result |
|-----|-------------|-------|--------|--------|--------|
| `accounts` | `tests.py` | 4 | 4 | 0 | **PASS** |
| `comments` | `tests.py` | 10 | 10 | 0 | **PASS** |
| `tickets` | `tests.py` | 16 | 16 | 0 | **PASS** |
| `tickets` | `test_workflow.py` | 10 | 10 | 0 | **PASS** |
| `tickets` | `test_seed_data.py` | 2 | 2 | 0 | **PASS** |
| **Total** | | **42** | **42** | **0** | **PASS** |

---

## Coverage Gaps

| Area | Status | Notes |
|------|--------|-------|
| Pagination | Not automated | No test for `?page=2`, `next`/`previous` links |
| Category filter | Not automated | `?category=` not explicitly tested |
| Description search | Not automated | Only title search tested |
| Ticket PUT (full update) | Not automated | PATCH tested; PUT verified manually |
| Frontend UI | Not automated | Manual QA via `acceptance-criteria.md` |
| Register validation errors | Not automated | Duplicate username, short password tested manually |

---

## How to Reproduce

```bash
cd backend
source ../venv/bin/activate
python manage.py test --verbosity=2
```

Expected output:

```
Ran 42 tests in ~18s
OK
```

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | Support Ticket Management System |
| **Last Run** | July 29, 2026 |
| **Overall Result** | **42 / 42 PASS** |
