# Priva — No Noise. Just Jobs That Match.

Priva is a modern full-stack job portal that connects the right candidates with the right jobs — without the clutter. It supports three user roles with tailored experiences for each.

![Priva Job Portal](https://img.shields.io/badge/Status-Live-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Node](https://img.shields.io/badge/Node.js-24-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Features

### Job Seekers
- Browse and search jobs by title, keyword, and location
- Filter by work mode (remote / hybrid / on-site), employment type, and experience level
- One-click job applications
- Save / bookmark jobs for later
- Track application status in real time: `Applied → Viewed → Shortlisted → Interview Scheduled → Hired / Rejected`
- Build a profile with skills and experience

### Recruiters
- Post and manage job listings
- View all applicants per job
- Update applicant status through the hiring pipeline
- Manage company profile

### Admins
- Platform-wide dashboard with stats (users, jobs, applications)
- Manage all users and job postings
- Toggle job active/inactive status

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TailwindCSS v4, shadcn/ui, Wouter, React Query |
| Backend | Express 5, express-session |
| Database | PostgreSQL, Drizzle ORM |
| Validation | Zod v4, drizzle-zod |
| API Contract | OpenAPI 3.1 → Orval codegen |
| Language | TypeScript 5.9 (strict) |
| Monorepo | pnpm workspaces |
| Runtime | Node.js 24 |

---

## Project Structure

```
priva/
├── artifacts/
│   ├── api-server/        # Express 5 backend
│   └── priva/             # React + Vite frontend
├── lib/
│   ├── api-spec/          # OpenAPI spec (source of truth)
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod schemas
│   └── db/                # Drizzle ORM schema + client
└── scripts/               # Seed and utility scripts
```

---

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 9+
- PostgreSQL database

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set environment variables

Create a `.env` file in the root (or set them in your environment):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/priva
SESSION_SECRET=your-secret-here
```

### 3. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Seed with demo data

```bash
pnpm --filter @workspace/scripts run seed
```

### 5. Start the development servers

**API server** (port 5000):
```bash
pnpm --filter @workspace/api-server run dev
```

**Frontend** (Vite dev server):
```bash
pnpm --filter @workspace/priva run dev
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@priva.dev | admin123 |
| Recruiter | sarah@techcorp.com | recruiter123 |
| Recruiter | marcus@startupxyz.io | recruiter123 |
| Job Seeker | alex@jobseeker.com | seeker123 |

---

## API Overview

The API follows a contract-first approach — all endpoints are defined in `lib/api-spec/openapi.yaml` and typed hooks are generated automatically.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/jobs` | List jobs (with filters) |
| GET | `/api/jobs/:id` | Get job detail |
| POST | `/api/jobs` | Post a job (recruiter) |
| GET | `/api/applications` | List applications |
| POST | `/api/applications` | Apply for a job |
| GET | `/api/saved-jobs` | List saved jobs |
| POST | `/api/saved-jobs` | Save a job |
| DELETE | `/api/saved-jobs/:jobId` | Unsave a job |
| GET | `/api/profile` | Get seeker profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/dashboard/admin` | Admin stats |
| GET | `/api/dashboard/recruiter` | Recruiter stats |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/jobs` | List all jobs |

---

## Scripts

```bash
pnpm run typecheck                        # Full typecheck across all packages
pnpm run build                            # Typecheck + build all packages
pnpm --filter @workspace/api-spec run codegen   # Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/db run push      # Push DB schema changes (dev only)
pnpm --filter @workspace/scripts run seed # Seed the database
```

---

## Architecture Notes

- **Session-based auth** — express-session with httpOnly + secure cookies
- **Contract-first API** — OpenAPI spec → codegen → typed hooks used everywhere; never call endpoints manually
- **Role-based access** — middleware guards all protected routes by user role
- **Monorepo** — pnpm workspaces with shared libs (`db`, `api-spec`, `api-client-react`, `api-zod`)

---

## License

MIT
