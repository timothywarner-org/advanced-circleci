# Globomantics Robot Fleet API
# Multi-stage Docker build for production deployment

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies and built application
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./src
COPY package*.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Build metadata (set during CI/CD)
ARG BUILD_DATE
ARG COMMIT_SHA
ENV BUILD_DATE=${BUILD_DATE}
ENV COMMIT_SHA=${COMMIT_SHA}

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health/live', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start application
CMD ["node", "src/index.js"]
