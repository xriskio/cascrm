---
name: Next.js client/server type imports
description: Importing types from API routes in client components causes hanging API routes in dev mode
---

## Rule
Never do `import type { Foo } from '@/app/api/.../route'` inside a client component (`'use client'`). Extract shared types to a dedicated `types/` file and import from there.

**Why:** Even though TypeScript strips `import type` at compile time, Next.js/webpack may still analyze the module graph and attempt to include the server-only API route file in the client bundle during compilation. This causes the dev server to hang silently on API requests — the route compiles each time (17-22s) but never responds.

**How to apply:** Any interface or type shared between an API route and a client component goes into `types/<domain>.ts`. Both the route and the component import from there. Example: `types/workflow.ts` for WorkflowItem used by both `/api/workflow-items/route.ts` and `components/dashboard/WorkflowKanban.tsx`.
