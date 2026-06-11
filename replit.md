# Priva

A full-stack job portal with the tagline "No Noise. Just Jobs That Match." Three user roles: Job Seeker, Recruiter, and Admin.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed database with demo data
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — express-session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS v4, shadcn/ui components, Wouter routing, React Query
- API: Express 5 + express-session (session-based auth)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — DB schema (users, profiles, companies, jobs, applications + enums)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod request/response schemas
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/priva/src/pages/` — all frontend pages
- `artifacts/priva/src/components/` — shared UI components and layout
- `scripts/src/seed.ts` — database seed script

## Architecture decisions

- Session-based auth (express-session) using `SESSION_SECRET` env var; cookies are httpOnly + secure in production
- Password hashing: SHA-256 + static salt (`priva_salt_2024`) — adequate for demo, swap to bcrypt for production
- Contract-first API: OpenAPI spec → codegen → typed hooks used everywhere; never call endpoints manually
- All routes share the `/api` prefix via the reverse proxy; paths are never rewritten
- Job status defaults to `active` when posted by a recruiter; admin can toggle active/inactive

## Product

- **Job Seekers**: Browse/search/filter jobs, apply in one click, track application status (applied → viewed → shortlisted → interview scheduled → hired/rejected)
- **Recruiters**: Post jobs, manage their company profile, view applicants per job, update applicant status
- **Admins**: View platform stats, manage all users and job postings, approve/reject/toggle jobs

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Always run `pnpm --filter @workspace/db run push` after changing DB schema
- `pnpm run typecheck` catches cross-package type errors that the editor may not show
- The reverse proxy routes `/api` to the API server; use relative paths in frontend code

## Demo credentials

- Admin: `admin@priva.dev` / `admin123`
- Recruiter: `sarah@techcorp.com` / `recruiter123`
- Recruiter: `marcus@startupxyz.io` / `recruiter123`
- Job Seeker: `alex@jobseeker.com` / `seeker123`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
