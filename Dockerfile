# syntax=docker/dockerfile:1
#
# Custom build for Railway (and any Docker host).
#
# This repo originated on Replit. Hosts that inherited Replit env vars inject
# NPM_CONFIG_REGISTRY=http://package-firewall.replit.local/npm/ and an LD_AUDIT
# rtld_loader, which break `pnpm install` (ENOTFOUND) and spam ld.so errors.
# We deliberately DO NOT declare build ARGs for those vars and we hardcode the
# public npm registry here, so the build never touches Replit infrastructure
# regardless of what variables the host injects.

FROM node:20-bookworm-slim AS base
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/ \
    npm_config_registry=https://registry.npmjs.org/ \
    LD_AUDIT="" \
    REPLIT_LD_AUDIT="" \
    NEXT_TELEMETRY_DISABLED=1
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
# Some modules construct a service-role client at import time, which `next build`
# triggers while collecting page data. The key is NOT validated or used during
# the build (no network calls), so a placeholder is enough to compile. The REAL
# SUPABASE_SERVICE_ROLE_KEY is provided at runtime by the host and is NOT baked
# into the final image (the run stage below does not set it).
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
