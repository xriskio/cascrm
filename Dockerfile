FROM node:20-alpine AS base
WORKDIR /app

# Install client dependencies
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm install

# Install server dependencies
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm install

# Copy all source
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/

# Build client (outputs to server/public/)
RUN cd client && npm run build

# Build server
RUN cd server && npm run build

# Runtime
FROM node:20-alpine AS runtime
WORKDIR /app

COPY --from=base /app/server/dist ./dist
COPY --from=base /app/server/public ./public
COPY --from=base /app/server/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
