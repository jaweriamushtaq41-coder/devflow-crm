# DevFlow CRM

**A production-style CRM built specifically for software houses.**
Full-Stack Development Internship Final Project — U Devs SMC PVT Limited, 2026.

DevFlow CRM connects business development with delivery: a lead becomes a client, a client's project generates
requirements and tasks, and every important action — status changes, approvals, deletions — leaves a visible
audit trail. It is designed to feel like an internal software-house platform, not a tutorial CRUD app.

---

## Table of Contents

1. [Project Description](#project-description)
2. [Technologies Used](#technologies-used)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Environment Variables](#environment-variables)
6. [Seed Accounts](#seed-accounts)
7. [Demo Walkthrough](#demo-walkthrough)
8. [API Overview](#api-overview)
9. [Implementation Notes & Scope](#implementation-notes--scope)

---

## Project Description

DevFlow CRM models the full lifecycle of how a software house manages:

- **CRM Core** — Leads, Prospects, Companies, Contacts, and a Sales Pipeline (Kanban) with drag-and-drop stages.
- **Project Management** — Projects, Milestones, Tasks (with a Task Board / Kanban), assignments and deadlines.
- **Requirement Vault** (signature feature) — Versioned requirements with attachments, comments, and a full
  approve / reject / request-clarification workflow, so specs never live only in WhatsApp or email again.
- **Client Portal** — A separate, strictly-scoped portal where clients see only their own projects, requirements,
  invoices, and support tickets.
- **Dashboard & Analytics** — Role-scoped KPI cards and a pipeline chart.
- **Operations** — Notifications, audit logs, RBAC enforced at both the frontend (UX) and backend (real security
  boundary) layers.

## Technologies Used

| Layer          | Technology                                             |
|----------------|---------------------------------------------------------|
| Frontend       | React 18 + Vite, Tailwind CSS, Material Symbols          |
| State          | Redux Toolkit (`createAsyncThunk`)                       |
| API Client     | Axios with an auth-refresh interceptor                   |
| Drag & Drop    | `@hello-pangea/dnd` (Kanban pipeline + task board)        |
| Charts         | Recharts                                                 |
| Backend        | Node.js + Express.js                                     |
| Database       | PostgreSQL                                               |
| ORM            | Sequelize                                                |
| Auth           | JWT (access + refresh, with rotation) + bcrypt           |
| Email          | NodeMailer (SMTP) — email verification & password reset  |
| Validation     | Zod                                                       |
| File Uploads   | Multer (type/size validated, safe filenames)              |

## Project Structure

```
devflow-crm/
├── backend/
│   ├── src/
│   │   ├── config/          # env loader, Sequelize connection, CLI config
│   │   ├── models/          # Sequelize models + associations (index.js)
│   │   ├── controllers/     # request handlers
│   │   ├── services/        # business logic (auth, lead, project, requirement, audit...)
│   │   ├── routes/          # Express routers, versioned under /api/v1
│   │   ├── middleware/      # auth, RBAC, validation, error handler, rate limit, upload
│   │   ├── validators/      # Zod schemas
│   │   ├── utils/           # tokens, response shape, pagination, email templates
│   │   ├── seeders/seed.js  # roles, permissions, demo accounts
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/              # axios instance + refresh interceptor
    │   ├── app/store.js       # Redux store
    │   ├── features/          # authSlice, leadSlice, requirementSlice, uiSlice, notificationSlice
    │   ├── layouts/            # DashboardLayout (internal), ClientPortalLayout
    │   ├── components/         # Sidebar, Topbar, KpiCard, StatusBadge, NotificationDrawer...
    │   ├── pages/               # LoginPage, LeadsPage, PipelinePage, RequirementDetailsPage...
    │   ├── pages/portal/         # Client Portal pages
    │   ├── routes/AuthGuard.jsx
    │   └── App.jsx
    ├── .env.example
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally (or a hosted instance)
- An SMTP account for email sending (e.g. [Mailtrap](https://mailtrap.io) for local testing, or Gmail/SendGrid)

### 1. Clone and install

```bash
git clone <your-repo-url> devflow-crm
cd devflow-crm

# Backend
cd backend
npm install
cp .env.example .env   # then edit .env with your real DB/SMTP values

# Frontend
cd ../frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL should point at your backend
```

### 2. Create the database

```sql
CREATE DATABASE devflow_crm;
CREATE USER devflow_user WITH PASSWORD 'devflow_pass';
GRANT ALL PRIVILEGES ON DATABASE devflow_crm TO devflow_user;
```
(Match these to whatever you put in `backend/.env`.)

### 3. Run the backend (auto-creates tables in development mode)

```bash
cd backend
npm run dev
```
You should see:
```
✅ Database connection established.
✅ Models synced (development mode).
🚀 DevFlow CRM API listening on http://localhost:5000
```

### 4. Seed roles, permissions, and demo accounts

```bash
npm run seed
```

### 5. Run the frontend

```bash
cd ../frontend
npm run dev
```
Visit **http://localhost:5173**.

> In production, replace `sequelize.sync()` with proper migrations: `npm run migrate`.

## Environment Variables

See `backend/.env.example` for the full list. Key ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` / `DB_*` | PostgreSQL connection |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Token signing secrets — change in production |
| `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES` | Token lifetimes (default 15m / 7d) |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | NodeMailer email verification & password reset |
| `CLIENT_URL` | Used to build verification/reset links |

**Never commit your real `.env` file, SMTP credentials, or production secrets to Git.**

## Seed Accounts

All demo accounts share the password: **`Demo@1234`**

| Email | Role |
|---|---|
| `admin@demo.local` | Super Admin |
| `sales@demo.local` | Sales / Business Developer |
| `pm@demo.local` | Project Manager |
| `developer@demo.local` | Developer / Team Member |
| `accounts@demo.local` | Accounts |
| `support@demo.local` | Support Agent |
| `client@demo.local` | Client (portal access, pre-linked to a demo company) |

⚠️ These are fake/demo credentials for local evaluation only — never reuse them in production.

## Demo Walkthrough

This mirrors the required demo sequence from the official project brief:

1. **Login as Admin** (`admin@demo.local`) → view the global dashboard.
2. **Create a Lead** in CRM → Leads → fill in name/email/source.
3. **Qualify** the lead by moving its status through the pipeline (Leads → lead details → Move Stage), or drag it
   across the Kanban board in CRM → Pipeline.
4. **Convert to Client** from the Lead Details page — this creates a `Client` record tied to a `Company`.
5. **Create a Project** for that client (Projects → New Project), using the client's ID.
6. **Add a Requirement** on the new project (Requirements → New Requirement).
7. **Approve** the requirement (Requirement Details → Approval panel — requires PM/Admin role).
8. **Create & Assign a Task** on the project's Task Board tab.
9. **Switch to Developer** (`developer@demo.local`) → go to **My Work** → move the task to Done.
10. **Switch to Client** (`client@demo.local`) → the Client Portal shows the project, its approved requirement, and
    progress.
11. From the portal, **create a Support Ticket**.
12. **Switch to Support** (`support@demo.local`) → resolve the ticket (via API/PATCH — a dedicated Tickets UI page
    is one of the natural next additions, see below).
13. **Return to Admin** → open **Audit Log** to see every action recorded with actor and timestamp.

## API Overview

Base URL: `http://localhost:5000/api/v1`

All responses share a consistent shape:
```json
{ "success": true, "message": "...", "data": {...} }
{ "success": true, "data": [...], "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
{ "success": false, "message": "...", "errors": [...], "code": "VALIDATION_ERROR" }
```

Key endpoint groups:
- `POST /auth/register|login|refresh|logout|forgot-password|reset-password|verify-email`
- `GET/POST/PATCH /leads`, `POST /leads/:id/convert`, `GET /deals/pipeline`
- `GET/POST /projects`, `POST /projects/:id/tasks`, `PATCH /tasks/:id/status`, `GET /projects/:id/board`
- `GET/POST /requirements`, `POST /requirements/:id/versions`, `POST /requirements/versions/:versionId/approve`
- `GET/POST /portal/*` — all scoped server-side to the authenticated client (never trusts a client-supplied ID)
- `GET /dashboard/summary`, `GET /audit-logs`, `GET /notifications`

A Postman collection is included at `docs/DevFlow-CRM.postman_collection.json`.

## Implementation Notes & Scope

This repository implements the full backend architecture (models, RBAC, auth incl. NodeMailer verification,
Requirement Vault versioning/approvals, client-scoped portal, audit logging) and the core frontend flows described
in the official brief: authentication, role-aware dashboard shell, Leads + Pipeline Kanban, Project + Task Board
Kanban, Requirement Vault UI with version history and approvals, and the Client Portal.

A few screens listed as "nice to have" in the brief's bonus section (dedicated Invoices UI, Users/Roles management
UI, global Ctrl/Cmd+K command palette, 2FA) are scaffolded at the API/permission level but intentionally left as
natural follow-ups so the codebase stays reviewable rather than sprawling. The `users.manage`/`invoices.manage`
permissions and underlying controllers already exist — wiring a UI table on top of them follows the exact same
pattern as the Leads/Requirements pages in this repo.
