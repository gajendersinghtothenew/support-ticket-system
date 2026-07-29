# Acceptance Criteria

**Project:** Support Ticket Management System  
**Format:** Checklist — each item must pass for the feature to be considered complete.

---

## Login

### Access & Routing
- [ ] Unauthenticated users can access the login page at `/login`.
- [ ] Authenticated users visiting `/login` are redirected to `/tickets`.
- [ ] Unauthenticated users attempting to access protected routes are redirected to `/login`.

### Form & Validation
- [ ] The login form displays fields for username and password.
- [ ] Username and password fields are required before submission.
- [ ] The submit button is disabled while the login request is in progress.
- [ ] A loading label ("Logging in...") is shown during submission.

### Successful Login
- [ ] Valid credentials authenticate the user via `POST /api/auth/login/`.
- [ ] A successful login stores the auth token and user profile in the client.
- [ ] The user is redirected to `/tickets` after a successful login.
- [ ] The returned user object includes `id`, `username`, `email`, and `role`.

### Failed Login
- [ ] Invalid credentials display an error message without redirecting.
- [ ] The error message is user-friendly (e.g. "Invalid username or password.").

### Session Persistence
- [ ] On page reload, an existing valid token restores the authenticated session via `GET /api/auth/me/`.
- [ ] Logged-in users see protected navigation (Dashboard, Tickets, Create Ticket).
- [ ] Logout clears the stored token and user profile.

---

## Registration

### Access & Routing
- [ ] Unauthenticated users can access the registration page at `/register`.
- [ ] Authenticated users visiting `/register` are redirected to `/tickets`.
- [ ] A link from the login page navigates to the registration page.

### Form & Validation
- [ ] The registration form displays fields for username, email, and password.
- [ ] All fields are required before submission.
- [ ] The password field enforces a minimum length of 8 characters (client-side).
- [ ] The submit button is disabled while the registration request is in progress.

### Successful Registration
- [ ] Valid input creates a new account via `POST /api/auth/register/`.
- [ ] The new user is assigned the **customer** role by default.
- [ ] A successful registration returns an auth token and logs the user in automatically.
- [ ] The user is redirected to `/tickets` after successful registration.

### Failed Registration
- [ ] Duplicate username or validation errors display a clear error message.
- [ ] The form remains on the registration page when registration fails.

### Navigation
- [ ] A link from the registration page navigates back to the login page.

---

## Ticket List

### Access & Display
- [ ] Authenticated users can access the ticket list at `/tickets`.
- [ ] The page displays a header with title and description.
- [ ] Tickets are shown as cards with ticket number, title, status, priority, category, creator, assignee, and created date.
- [ ] Each ticket title links to its detail page (`/tickets/{id}`).

### Role-Based Visibility
- [ ] Customers see only tickets they created.
- [ ] Agents and admins see all tickets in the system.

### States
- [ ] A loading spinner is shown while tickets are being fetched.
- [ ] An error message with a retry option is shown when the API request fails.
- [ ] An empty state is shown when no tickets match the current view.
- [ ] When filters are active and no tickets match, the empty state indicates no matching tickets.

### Result Summary
- [ ] When tickets are present, a count summary is displayed (e.g. "Showing X of Y tickets").

---

## Ticket Details

### Access & Display
- [ ] Authenticated users can view a ticket at `/tickets/{id}`.
- [ ] The page displays the ticket number, title, full description, status, priority, category, creator, assignee, and timestamps.
- [ ] Status and priority are shown using color-coded badges.

### Role-Based Access
- [ ] Customers can view only their own tickets.
- [ ] Agents and admins can view any ticket.
- [ ] Customers attempting to access another user's ticket receive a not-found or error state (API returns 404).

### Navigation & Actions
- [ ] An edit link/button navigates to `/tickets/{id}/edit` for accessible tickets.
- [ ] A link navigates back to the ticket list.

### States
- [ ] A loading spinner is shown while the ticket is being fetched.
- [ ] An error message is shown when the ticket cannot be loaded.
- [ ] Ticket metadata is rendered via the `TicketMeta` component.

---

## Create Ticket

### Access & Routing
- [ ] Authenticated users can access the create ticket page at `/tickets/new`.
- [ ] The create form is available from the navbar ("Create Ticket").

### Form Fields
- [ ] The form includes fields for title, description, category, and priority.
- [ ] Category options include IT Support, Access, Admin Issue, and HR.
- [ ] Priority options include Low, Medium, High, and Urgent.

### Validation
- [ ] Title must be at least 5 characters (enforced by API).
- [ ] Description must be at least 10 characters (enforced by API).
- [ ] Validation errors from the API are displayed on the form.

### Submission
- [ ] A successful submission creates a ticket via `POST /api/tickets/`.
- [ ] The new ticket is created with **open** status.
- [ ] `created_by` is set automatically to the authenticated user.
- [ ] A unique ticket number (e.g. `TKT-00001`) is assigned automatically.
- [ ] After creation, the user is redirected to the new ticket's detail page or ticket list.

### States
- [ ] The submit button is disabled while the request is in progress.
- [ ] API errors are displayed if ticket creation fails.

---

## Edit Ticket

### Access & Routing
- [ ] Authenticated users can access the edit page at `/tickets/{id}/edit`.
- [ ] Customers can edit only their own tickets.
- [ ] Agents and admins can edit any ticket.

### Form Behavior
- [ ] The edit form is pre-populated with the ticket's current title, description, category, and priority.
- [ ] The form reuses the same `TicketForm` component as create (in edit mode).
- [ ] Status is not editable through the edit form (status changes use the workflow).

### Validation
- [ ] Title and description validation rules match create ticket (min 5 / min 10 characters).
- [ ] Validation errors from the API are displayed on the form.

### Submission
- [ ] A successful update persists changes via `PATCH /api/tickets/{id}/`.
- [ ] After a successful update, the user is redirected to the ticket detail page.
- [ ] Updated fields are reflected on the detail page.

### States
- [ ] A loading spinner is shown while the ticket is being loaded for editing.
- [ ] An error state is shown if the ticket cannot be loaded.
- [ ] The submit button is disabled while the update request is in progress.

---

## Comments

### Display
- [ ] The ticket detail page displays a comment thread for the ticket.
- [ ] Comments show the author, body, timestamp, and internal note indicator (for agents).
- [ ] Comments are listed in chronological order (oldest first).

### Create Comment
- [ ] Authenticated users can post a comment on tickets they can access.
- [ ] The comment form includes a text area for the comment body.
- [ ] Comment body must be at least 2 characters (client and API validation).
- [ ] A successful comment is added to the thread without a full page reload.
- [ ] The comment form clears after a successful submission.

### Internal Comments (Agents/Admins)
- [ ] Agents and admins see an "Internal note" checkbox on the comment form.
- [ ] Internal comments can be created via `POST /api/comments/` with `is_internal: true`.
- [ ] Internal comments are visible to agents and admins in the comment list.
- [ ] Customers do not see internal comments in the thread.

### Customer Restrictions
- [ ] Customers cannot create internal comments.
- [ ] Customers cannot see internal comments on their tickets.

### States
- [ ] A loading state is shown while comments are being fetched.
- [ ] An error message is shown if comments fail to load.
- [ ] An empty state is shown when no comments exist on the ticket.
- [ ] Comment submission errors are displayed on the form.

---

## Ticket Workflow

### Status Display
- [ ] The ticket detail page shows the current status with a badge.
- [ ] The status actions section displays only transitions allowed for the user's role.

### Agent/Admin Transitions
- [ ] Agents and admins can transition **open** → in progress, closed.
- [ ] Agents and admins can transition **in progress** → waiting on customer, resolved, closed.
- [ ] Agents and admins can transition **waiting on customer** → in progress.
- [ ] Agents and admins can transition **resolved** → closed, reopened.
- [ ] Agents and admins can transition **reopened** → in progress.
- [ ] Agents and admins can transition **closed** → reopened.

### Customer Transitions
- [ ] Customers can transition **resolved** → reopened.
- [ ] Customers can transition **closed** → reopened.
- [ ] Customers cannot perform any other status transitions.

### Transition Behavior
- [ ] Invalid transitions are rejected by the API with a 400 error.
- [ ] A successful status change updates the ticket on the detail page.
- [ ] A success notification is shown after a valid status change.
- [ ] Transitioning to **resolved** sets `resolved_at`.
- [ ] Transitioning to **closed** sets `closed_at`.
- [ ] Transitioning to **reopened** clears `resolved_at` and `closed_at`.

### UI Controls
- [ ] Allowed transitions are available via a dropdown and/or quick-action buttons.
- [ ] When no transitions are available, a message explains that no status changes are possible.
- [ ] The status control is disabled while an update is in progress.

---

## Search

### Search Input
- [ ] The ticket list page includes a search input labeled "Search".
- [ ] The placeholder text indicates search by title or description.
- [ ] Search is applied against ticket title and description (case-insensitive).

### Search Behavior
- [ ] Search queries are sent to the API via the `search` query parameter.
- [ ] Search input is debounced (300ms) to limit API calls while typing.
- [ ] Changing the search term resets pagination to page 1.
- [ ] Search results respect role-based ticket visibility.

### Search Results
- [ ] Only tickets matching the search term are displayed.
- [ ] When no tickets match the search, an appropriate empty state is shown.
- [ ] Search can be combined with status, priority, and category filters.

### Clear Search
- [ ] Clearing the search field restores the unfiltered list (or list with other active filters).
- [ ] The "Clear filters" button resets the search field along with other filters.

---

## Filters

### Filter Controls
- [ ] The ticket list includes a status filter dropdown with an "All statuses" default.
- [ ] The ticket list includes a priority filter dropdown with an "All priorities" default.
- [ ] The ticket list includes a category filter dropdown with an "All categories" default.
- [ ] Filter options match the system's defined statuses, priorities, and categories.

### Filter Behavior
- [ ] Selecting a filter sends the corresponding query parameter to `GET /api/tickets/`.
- [ ] Changing any filter resets pagination to page 1.
- [ ] Filters respect role-based ticket visibility.
- [ ] Multiple filters can be applied simultaneously (AND logic).

### URL Integration
- [ ] Filters can be initialized from URL query parameters (e.g. `/tickets?status=open`).
- [ ] Dashboard stat card links navigate to pre-filtered ticket list views.

### Clear Filters
- [ ] A "Clear filters" button is visible when any filter or search is active.
- [ ] Clicking "Clear filters" resets search, status, priority, and category to defaults.
- [ ] After clearing, the full accessible ticket list is displayed.

---

## Pagination

### Display
- [ ] The ticket list shows Previous and Next pagination controls when applicable.
- [ ] The current page number is displayed between the navigation buttons.
- [ ] Pagination controls are hidden when all results fit on a single page.

### Behavior
- [ ] The API returns paginated results with `count`, `next`, `previous`, and `results`.
- [ ] Each page contains up to 20 tickets (API page size).
- [ ] Clicking "Next" loads the next page of results.
- [ ] Clicking "Previous" loads the previous page of results.
- [ ] The Previous button is disabled on the first page.
- [ ] The Next button is disabled on the last page.

### Interaction with Search & Filters
- [ ] Pagination applies to the current search and filter combination.
- [ ] Changing search or filters resets to page 1.
- [ ] Navigating between pages preserves active search and filter values.

### Result Summary
- [ ] The result count summary reflects the total matching tickets across all pages.

---

## Document Control

| Field | Value |
|-------|-------|
| **Project** | Support Ticket Management System |
| **Scope** | Implemented features only |
| **Status** | Ready for manual QA verification |
