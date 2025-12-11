# Smart HR

Smart HR is a multi-tenant workforce operations platform built on Next.js 16. It centralizes employee data, automates attendance and leave workflows, powers finance reviews for invoices, and surfaces live insights for HR administrators. The application ships with a tRPC-powered API layer, Prisma ORM, Socket.IO messaging, and S3-compatible storage for attachments.

## Features

- **Multi-tenant workspaces & RBAC** — Organizations, departments, teams, and rich role hierarchy (`SUPER_ADMIN` → `EMPLOYEE`) are modeled in `prisma/schema.prisma`.
- **System Owner console & tenant guardrails** — Super admins get a dedicated `/system-owner` cockpit with org provisioning, cross-tenant dashboards, and TRPC guards (`requireSuperAdmin`) that hard-stop unauthorized users from viewing other tenants.
- **Workforce analytics dashboard** — `server/modules/hr/dashboard` aggregates attendance, engagement, coverage, and policy adherence KPIs with timezone-aware scheduling.
- **Attendance automation** — Remote vs onsite inference, lateness detection, shift policies, and granular logs reside in `server/modules/hr/attendance`.
- **Leave & PTO management** — Submission, approval, attachment handling, and secure download tokens (see `server/modules/leave`) cover the full leave lifecycle.
- **Employee lifecycle** — Invitations, onboarding flows, employment records, bank details, and emergency contacts are orchestrated via `server/modules/hr/employees`.
- **Project portfolio management** — HR, org admins, managers, and super admins can spin up initiatives, assign project managers/members, and drive CRUD workflows via `app/(hr-admin)/hr-admin/project-management` backed by `server/modules/hr/project`.
- **Invoices & payroll review** — Employees confirm payroll-ready invoices with short-lived unlock tokens implemented in `server/modules/invoice`.
- **Reports & compliance** — Daily/monthly reporting plus exports in `server/modules/report` give HR verifiable history.
- **Messaging & notifications** — Threaded conversations, notifications, and Socket.IO (`pages/api/socket.ts`, `server/modules/messages`) enable real-time collaboration.
- **Storage & documents** — Cloudflare R2 / S3 buckets (see `server/storage/r2.ts`) store policies, proofs, and downloadable artifacts with signed URLs.

## Technology Stack

- **Frontend** — Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 3, DaisyUI, next/font (Geist), TanStack Query, React Hook Form, React Datepicker, React Icons.
- **API & Services** — Next.js Route Handlers, tRPC 11, Prisma 6, NextAuth custom session helpers, Socket.IO, Zod validation, jsonwebtoken, bcryptjs.
- **Data & Infrastructure** — PostgreSQL, S3-compatible object storage (Cloudflare R2 or AWS S3), Nodemailer (Gmail) for transactional mail, AWS SDK v3 for S3.
- **Tooling & DX** — ESLint 9 + `eslint-config-next`, Tailwind/PostCSS toolchain, `tsx` for scripts, Prisma Migrate/Studio, npm scripts (`dev`, `build`, `start`, `lint`).

## Project Setup

1. **Clone & install**
   ```bash
   git clone <repo-url>
   cd smart-hr
   npm install
   ```
2. **Create your environment file** — Copy an existing `.env` (if present) or create a new one at the repo root using the variables listed below.
3. **Provision PostgreSQL & storage** — Start a PostgreSQL instance (local Docker container or managed service) and an S3-compatible bucket (Cloudflare R2, AWS S3, etc.).
4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```
5. **Seed reference data (optional)**
   ```bash
   npx prisma db seed
   ```
6. **Start the Next.js dev server**
   ```bash
   npm run dev
   # visit http://localhost:3000
   ```

## Environment Setup

### Required services

- **PostgreSQL** — Prisma targets PostgreSQL (`datasource db` in `prisma/schema.prisma`). Provide a connection string via `DATABASE_URL`.
- **S3-compatible storage** — Attachments and organization assets are uploaded via the AWS SDK configured in `server/storage/r2.ts`. Cloudflare R2 or AWS S3 both work.
- **SMTP (Gmail by default)** — Password reset and invite flows depend on Nodemailer with Gmail service credentials.

### Environment variables

#### Core application

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `NEXTAUTH_URL` | Yes (prod) | Fully qualified base URL for NextAuth callbacks and absolute links. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public URL exposed to the client for password resets and email links. |
| `NEXT_PUBLIC_BASE_URL` | No | Override host for invitation links when marketing and app domains differ. |
| `PORT` | No | Port used by `next dev` and invite helpers (defaults to `3000`). |
| `NODE_ENV` | No | Controls logging and cookie security (`development`/`production`). |
| `VERCEL_URL` | Auto | Provided by Vercel; used as a fallback for absolute URLs. |

#### Authentication & security

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth session/JWT signing (also used by Socket.IO auth). |
| `NEXT_PUBLIC_JWT_SECRET` | Yes | Base secret shared by password reset, invite, and attachment flows. |
| `JWT_SECRET` | No | Server-only fallback secret when `NEXT_PUBLIC_JWT_SECRET` is absent. |
| `AUTH_SECRET` | No | Legacy fallback secret for token validation. |
| `INVOICE_UNLOCK_SECRET` | No | Dedicated secret for invoice unlock tokens (`server/modules/invoice`). |
| `LEAVE_ATTACHMENT_TOKEN_SECRET` | No | Secret for leave attachment download tokens. |
| `LEAVE_ATTACHMENT_TOKEN_TTL` | No | Override attachment token lifetime (default `30d`). |
| `NEXT_PUBLIC_INVITE_TOKEN_TTL_HOURS` / `INVITE_TOKEN_TTL_HOURS` | No | Invitation expiry in hours (default `72`). |
| `NEXT_PUBLIC_TRIAL_DURATION_DAYS` | No | Trial period before organizations require activation (default `10`). |
| `NEXT_PUBLIC_ACCOUNT_VISIBILITY` | No | Set to `PRIVATE` to block expired trials from logging in. |

#### Email & messaging

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_EMAIL_USER` | Yes | Gmail/SMTP user used by Nodemailer for invites & reset emails. |
| `NEXT_PUBLIC_EMAIL_PASS` | Yes | App password or SMTP password paired with the email user. |

#### Storage & assets

| Variable | Required | Purpose |
| --- | --- | --- |
| `S3_ENDPOINT` | Yes | HTTPS endpoint for your S3-compatible bucket (Cloudflare R2, etc.). |
| `S3_REGION` | No | Region for the bucket (`auto` by default for R2). |
| `S3_ACCESS_KEY_ID` | Yes | Access key for the bucket. |
| `S3_SECRET_ACCESS_KEY` | Yes | Secret key for the bucket. |
| `S3_BUCKET` | Yes | Bucket name where uploads are stored. |
| `S3_PUBLIC_BASE_URL` | Yes | Public CDN/base URL; also feeds `next.config.ts` remote image patterns. |

> Tip: Keep `NEXT_PUBLIC_JWT_SECRET`, `JWT_SECRET`, and `AUTH_SECRET` aligned to avoid token verification mismatches between the server and browser runtime.

## Deployment Guidelines

1. **Prepare infrastructure**
   - Provision a managed PostgreSQL instance and run `npx prisma migrate deploy` against it.
   - Create the object storage bucket + CDN, and update the `S3_*` variables.
   - Configure SMTP credentials that work from your runtime (Gmail requires an App Password).
2. **Configure environment secrets**
   - Mirror the `.env` values into your platform’s secret store (Vercel, Docker, Kubernetes, etc.).
   - Ensure `NEXTAUTH_URL` matches the production hostname and uses HTTPS.
3. **Build & verify**
   ```bash
   npm run lint
   npm run build
   ```
   The `postinstall` hook runs `prisma generate`, so ensure build containers execute `npm install`.
4. **Database seeding (optional)**
   ```bash
   npx prisma db seed
   ```
   Run only when you need sample organizations/data in non-production environments.
5. **Launch the server**
   ```bash
   npm run start
   ```
   - For containerized or VM deployments, wrap the command with a process manager such as PM2 or systemd.
   - On Vercel or similar platforms, deploy via `vercel --prod` once all env vars are set. Socket.IO lives at `pages/api/socket.ts`, so choose a hosting target that supports WebSockets/persistent functions.

## Useful Commands

- `npm run dev` — Start the Next.js dev server with hot reloading.
- `npm run build` — Compile the production bundle (runs `next build`).
- `npm run start` — Launch the production server (requires prior build).
- `npm run lint` — Run ESLint with the Next.js config.
- `npx prisma studio` — Open Prisma Studio for inspecting Postgres data.
- `npx prisma migrate dev` / `npx prisma migrate deploy` — Apply schema changes locally or in production.

With the sections above you now have a complete view of the platform’s feature set, technology stack, environment requirements, deployment workflow, and day-to-day project setup steps.
