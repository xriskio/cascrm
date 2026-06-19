# AGENTS.md

## Cursor Cloud specific instructions

This is **InsureTrac** — a single Next.js 14 (App Router) app that serves both the
frontend and its API routes/server actions. Backend is **Supabase** (Postgres + Auth +
Storage). There is only one app to run; `reference/` and `attached_assets/` are sample
code and are not part of the product.

The update script installs JS deps (`pnpm install`). **Docker** and the **Supabase CLI**
are pre-installed in the VM snapshot — do not reinstall them. The notes below are the
non-obvious startup/run caveats.

### Local Supabase (required for the app to work)
The app talks to a **local** Supabase stack, not a hosted project.

- Docker must be running. If `docker ps` fails, start the daemon in the background
  (`sudo dockerd &`) and ensure the socket is usable (`sudo chmod 666 /var/run/docker.sock`).
  This VM uses the `fuse-overlayfs` storage driver with the containerd snapshotter
  disabled (see `/etc/docker/daemon.json`) — required for Docker to work here.
- Start the stack from the repo root: `supabase start` (config in `supabase/config.toml`).
- Get the local keys with `supabase status -o env` (they are stable local demo keys).
- Studio: http://127.0.0.1:54323 · API: http://127.0.0.1:54321 · DB:
  `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.

### Required env (`.env.local`, gitignored — must exist, not committed)
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key from `supabase status -o env`>
SUPABASE_SERVICE_ROLE_KEY=<local service_role key>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```
`drizzle-kit` (`pnpm run db:*`) reads `DATABASE_URL` from the process env, NOT `.env.local`
— export it before running those commands.

### Schema is drifted — heads up
`shared/schema.ts` (Drizzle), the root `*.sql` scripts, and `supabase/migrations_backup/`
disagree on column names for core tables, and the **runtime queries** are the real source
of truth (e.g. `renewals` uses `named_insured`/`lob`/`carrier`/`premium`/`agent_name`, not
the SQL files' `insured_name`/`insurance_carrier`). The local DB was built by loading
`RUN_THIS_IN_SUPABASE.sql` (for `leads`/`tasks`/`users`/etc.) plus creating Drizzle-shaped
`clients`/`renewals`/`submissions`/`policies`/`inspections`/`document_requests`/`market_submissions`.
`renewals` also needs the QQ-import columns (`policy_id`, `insured_name`, `business_name`,
`policy_premium`, `source`, `external_id`). RLS is disabled and grants go to
`anon`/`authenticated`/`service_role`. If the DB is empty after a fresh start, reload this
schema before using the app. **Do not run `pnpm run db:push`** — it tries to drop every
table not in the Drizzle schema (users, leads, tasks, …).

### Test login
`ops@casurance.net` / `Casurance123!` (admin). Created via the Auth admin API plus a
matching `public.users` row (`role='admin'`). Recreate via
`POST {SUPABASE_URL}/auth/v1/admin/users` with the service-role key if missing.

### Run / build / typecheck
- Dev: `pnpm run dev` → http://localhost:5000 (binds `0.0.0.0`). This is the dev command to use.
- Type-check: `pnpm run type-check` (`tsc --noEmit`). This is the reliable static check.
- `next lint` has **no ESLint config** and prompts interactively — don't rely on it in CI.
- `next.config.mjs` sets `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` to
  `true`, so `pnpm run build` will not fail on type/lint errors; use `type-check` for those.
- Regenerate Supabase types after schema changes:
  `supabase gen types typescript --local --schema public > types/supabase.d.ts`.

### QQCatalyst integration (optional)
Needs `QQ_CLIENT_ID`, `QQ_CLIENT_SECRET`, `QQ_USERNAME`, `QQ_PASSWORD` (optionally
`QQCATALYST_API_URL`, `QQCATALYST_BEARER_TOKEN`) — add via the **Secrets** panel so they're
injected into new VMs. Auth uses the OAuth **password grant**; `client_credentials` returns
"User cannot be identified" for policy endpoints. Import renewals via the
`/renewals/import` UI (QQCatalyst tab) or `POST /api/qqcatalyst/renewals/import-filtered`
with `{ "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }` — it filters policies by
**expiration date** within that window.

See also `.agents/memory/` for two important gotchas (QQ auth grant type; never import
types from API route files into client components or the dev server hangs).
