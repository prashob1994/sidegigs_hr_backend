# ============================================================
#  SidGigs HR Backend — Production Docker Image
#  Node.js 20 LTS (Alpine) with ES-module support
# ============================================================

# ── Stage 1: Dependency installer ────────────────────────────
FROM node:20-alpine AS deps

# Install OS-level build tools (needed for some native addons)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy only manifests first so Docker layer-caches node_modules
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production


# ── Stage 2: Production image ─────────────────────────────────
FROM node:20-alpine AS runner

# Create non-root user for security
RUN addgroup -S sidgigs && adduser -S sidgigs -G sidgigs

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Ensure uploads / public dirs exist and are owned by non-root user
RUN mkdir -p uploads public \
    && chown -R sidgigs:sidgigs /app

USER sidgigs

# Expose the application port
EXPOSE 3000

# Health-check — polls the root endpoint every 30 s
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Start the server
CMD ["node", "index.js"]
