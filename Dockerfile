# syntax=docker/dockerfile:1
#
# Custom build for Railway (and any Docker host).
#
# A Docker build does NOT inherit the host's environment unless a variable is
# explicitly declared as ARG. We deliberately do NOT declare ARGs for the
# npm-registry or ld.so-audit variables, so even if the deploy platform has
# them set (e.g. copied from another environment), they cannot affect this
# build. Package resolution uses the committed .npmrc (public npm registry).

FROM node:20-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@10.33.3
WORKDIR /app

# ---- deps: install node_modules (cached unless the lockfile changes) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# ---- build: compile the Next.js app ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# must be present during `next build`. Railway passes service variables as
# build args; declare only the public (non-secret) ones we need.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
# Some modules construct service clients at import time, which `next build`
# triggers while collecting page data. These keys are NOT validated or used at
# build time (no network calls), so placeholders are enough to compile. The
# REAL values are provided at runtime by the host and are NOT baked into the
# final image (the run stage below does not set them).
ARG SUPABASE_SERVICE_ROLE_KEY="build-time-placeholder-not-used-at-runtime"
ARG RESEND_API_KEY="re_build_placeholder"
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
    RESEND_API_KEY=$RESEND_API_KEY
RUN pnpm run build

# ---- run: production server ----
FROM base AS run
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 5000
CMD ["pnpm", "run", "start"]
