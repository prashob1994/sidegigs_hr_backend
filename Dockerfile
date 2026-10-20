# ============================================================
# SidGigs HR Backend — Production Docker Image
# Node.js 20 LTS (Alpine) with ES-module support
# ============================================================

# ── Stage 1: Dependency installer ────────────────────────────
FROM node:20-alpine AS deps

# Install build tools required by native npm dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package manifest (no Yarn required)
COPY package.json ./

# Install production dependencies
RUN npm install --omit=dev --no-audit --no-fund


# ── Stage 2: Production image ─────────────────────────────────
FROM node:20-alpine AS runner

# Create non-root user for security
RUN addgroup -S sidgigs && adduser -S sidgigs -G sidgigs

WORKDIR /app

ENV NODE_ENV=production

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create required directories and set permissions
RUN mkdir -p uploads public \
    && chown -R sidgigs:sidgigs /app

USER sidgigs

# Application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

# Start the server
CMD ["node", "index.js"]