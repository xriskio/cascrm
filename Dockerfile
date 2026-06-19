FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* .npmrc* ./

# Install dependencies using official pnpm (not Replit-patched)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm run build

# Runtime
EXPOSE 3000

ENV NODE_ENV=production

CMD ["pnpm", "start"]
