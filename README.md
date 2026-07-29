# Support Ticket Management System

A full-stack support ticket management application with role-based access control, ticket workflows, comments, search and filtering, and role-specific dashboards. Customers can submit and track their own tickets; agents and admins can manage the full support queue.

## Project Overview

This project is a modern help desk solution built as a decoupled **Django REST API** backend and a **React** single-page frontend. It supports three user roles—**customer**, **agent**, and **admin**—with distinct permissions and views.

Customers create tickets, add comments, and reopen resolved or closed tickets. Agents and admins can view all tickets, transition statuses through a defined workflow, leave internal notes, and delete tickets. The dashboard provides at-a-glance metrics tailored to each role.

## Features

### Authentication & Authorization
- User registration and token-based login
- Role-based permissions (customer, agent, admin)
- Protected API endpoints and frontend routes

### Ticket Management
- Create, view, edit, and delete tickets (delete restricted to agents/admins)
- Auto-generated ticket numbers (e.g. `TKT-00001`)
- Status workflow with role-specific allowed transitions
- Priority levels: Low, Medium, High, Urgent
- Categories: IT Support, Access, Admin Issue, HR
- Ticket assignment support (backend)

### Comments
- Public comments on tickets
- Internal notes visible only to agents and admins
- Per-ticket comment threads via API filter

### Ticket List
- Search by title or description
- Filter by status, priority, and category
- Clear filters control
- Paginated results

### Dashboard
- Role-specific summary cards and metrics
- Status breakdown visualization
- Recent tickets list
- Quick navigation to filtered ticket views

### Developer Experience
- Seed data command for sample users, tickets, and comments
- Django admin for model management
- Comprehensive backend test suite

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Python, Django 4.2, Django REST Framework, django-filter, Token Authentication |
| **Frontend** | React 19, React Router 7, Vite 8 |
| **Database** | SQLite (development) |
| **API** | RESTful JSON API |

## Project Structure

```
support-ticket-system/
├── backend/
│   ├── accounts/          # User profiles, auth, roles
│   ├── comments/          # Ticket comments and internal notes
│   ├── config/            # Django settings and URL routing
│   ├── tickets/           # Tickets, filters, workflow, stats, seed data
│   │   ├── management/commands/seed_data.py
│   │   └── services/
│   │       ├── workflow.py
│   │       └── stats.py
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/           # API client and endpoint wrappers
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Route-level pages
│   │   ├── routes/        # Route guards and configuration
│   │   └── utils/         # Constants, formatters, error helpers
│   ├── package.json
│   └── vite.config.js
└── venv/                  # Python virtual environment (local)
```

## Installation

### Prerequisites

- **Python** 3.8+
- **Node.js** 18+ and npm
- **Git**

### Clone the Repository

```bash
git clone <repository-url>
cd support-ticket-system
```

## Backend Setup

1. **Create and activate a virtual environment:**

```bash
python3 -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate           # Windows
```

2. **Install Python dependencies:**

```bash
pip install django==4.2.30 djangorestframework==3.15.2 django-filter==24.3
```

3. **Apply database migrations:**

```bash
cd backend
python manage.py migrate
```

4. **(Optional) Load sample data:**

```bash
python manage.py seed_data
```

Use `--clear` to remove existing seed data before re-seeding:

```bash
python manage.py seed_data --clear
```

5. **(Optional) Create a Django superuser for admin access:**

```bash
python manage.py createsuperuser
```

The Django admin panel is available at `http://127.0.0.1:8000/admin/`.

## Frontend Setup

1. **Install Node dependencies:**

```bash
cd frontend
npm install
```

2. **Development server configuration:**

The Vite dev server proxies `/api` requests to `http://127.0.0.1:8000` (see `frontend/vite.config.js`). No additional environment variables are required for local development.

## Database Setup

The project uses **SQLite** by default. The database file is created automatically at `backend/db.sqlite3` when you run migrations.

No separate database server installation is needed for local development.

To reset the database during development:

```bash
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py seed_data
```

## Running the Application

Start both the backend and frontend in separate terminals.

**Terminal 1 — Backend:**

```bash
cd backend
source ../venv/bin/activate
python manage.py runserver
```

API available at: `http://127.0.0.1:8000/api/`

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Application available at: `http://localhost:5173`

Log in with one of the [default test users](#default-test-users) below.

### Production Build (Frontend)

```bash
cd frontend
npm run build
npm run preview
```

## Running Tests

All backend tests use Django's built-in test runner.

```bash
cd backend
source ../venv/bin/activate
python manage.py test
```

Run tests for a specific app:

```bash
python manage.py test accounts
python manage.py test tickets
python manage.py test comments
```

## API Overview

Base URL: `http://127.0.0.1:8000/api/`

Authentication: include the token in the `Authorization` header:

```
Authorization: Token <your-auth-token>
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register/` | Register a new customer account |
| `POST` | `/api/auth/login/` | Log in and receive an auth token |
| `GET` | `/api/auth/me/` | Get the current authenticated user |

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tickets/` | List tickets (paginated, filterable) |
| `POST` | `/api/tickets/` | Create a new ticket |
| `GET` | `/api/tickets/stats/` | Dashboard summary statistics |
| `GET` | `/api/tickets/{id}/` | Retrieve a ticket |
| `PATCH` | `/api/tickets/{id}/` | Update a ticket (including status) |
| `DELETE` | `/api/tickets/{id}/` | Delete a ticket (agents/admins only) |

**List query parameters:**

| Parameter | Description |
|-----------|-------------|
| `page` | Page number for pagination |
| `search` | Search title and description |
| `status` | Filter by status |
| `priority` | Filter by priority |
| `category` | Filter by category |

**Ticket statuses:** `open`, `in_progress`, `waiting_on_customer`, `resolved`, `reopened`, `closed`

**Priorities:** `low`, `medium`, `high`, `urgent`

**Categories:** `it_support`, `access`, `admin_issue`, `hr`

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/comments/` | List comments (`?ticket=<id>` to filter) |
| `POST` | `/api/comments/` | Create a comment |
| `GET` | `/api/comments/{id}/` | Retrieve a comment |
| `PATCH` | `/api/comments/{id}/` | Update a comment |
| `DELETE` | `/api/comments/{id}/` | Delete a comment |

## Default Test Users

All seed users share the password: **`password123`**

| Username | Email | Role |
|----------|-------|------|
| `customer_alice` | alice@example.com | Customer |
| `customer_bob` | bob@example.com | Customer |
| `customer_carol` | carol@example.com | Customer |
| `agent_sarah` | sarah@example.com | Agent |
| `agent_mike` | mike@example.com | Agent |
| `admin_diana` | diana@example.com | Admin |

**Suggested logins for testing:**

- **Customer view:** `customer_alice` / `password123`
- **Agent view:** `agent_sarah` / `password123`
- **Admin view:** `admin_diana` / `password123`

## Future Improvements

- **Production deployment** — PostgreSQL, environment-based settings, and static file serving
- **CORS configuration** — `django-cors-headers` for non-proxied frontend deployments
- **Ticket assignment UI** — Assign and reassign tickets from the frontend
- **Email notifications** — Notify users on status changes and new comments
- **Comment management UI** — Edit and delete comments from the frontend
- **Audit history** — Track ticket status and assignment changes over time
- **File attachments** — Upload screenshots and documents on tickets
- **SLA tracking** — Due dates and breach alerts by priority
- **Agent workload filters** — Filter tickets by assignee in the list view
- **requirements.txt** — Pin backend dependencies for reproducible installs
- **Docker Compose** — One-command local and production setup

## License

This project is provided for educational and development purposes. Add a license file before distributing or deploying to production.
