# Globomantics Robot Fleet API
# Multi-stage Docker build for production deployment

# =============================================================================
# Stage 1: Dependencies - Install production dependencies only
# =============================================================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# =============================================================================
# Stage 2: Build - Install all deps and build the application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev)
RUN npm ci --ignore-scripts

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Run build step (copies src to dist)
RUN npm run build

# =============================================================================
# Stage 3: Production - Minimal runtime image
# =============================================================================
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./src
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Copy package.json for version info
COPY --chown=nodejs:nodejs package.json ./

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Build metadata (set during CI/CD)
ARG BUILD_DATE=unknown
ARG COMMIT_SHA=unknown
ARG VERSION=1.0.0

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${COMMIT_SHA}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.title="Globomantics Robot Fleet API" \
      org.opencontainers.image.description="Robot fleet management API for CI/CD training" \
      org.opencontainers.image.vendor="Globomantics"

ENV BUILD_DATE=${BUILD_DATE} \
    COMMIT_SHA=${COMMIT_SHA}

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health/live', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Use dumb-init as entrypoint for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]
