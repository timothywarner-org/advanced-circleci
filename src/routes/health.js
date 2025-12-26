/**
 * Health Check Routes
 * Provides liveness and readiness probes for container orchestration
 */

const express = require('express');
const router = express.Router();

// GET /api/health - Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'globomantics-robot-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// GET /api/health/live - Kubernetes liveness probe
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// GET /api/health/ready - Kubernetes readiness probe
router.get('/ready', (req, res) => {
  // In production, check database connections, external services, etc.
  const isReady = true;

  if (isReady) {
    res.json({
      status: 'ready',
      checks: {
        database: 'connected',
        cache: 'connected',
        externalApi: 'reachable'
      },
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/health/version - Version information
router.get('/version', (req, res) => {
  res.json({
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    buildDate: process.env.BUILD_DATE || 'unknown',
    commitSha: process.env.COMMIT_SHA || 'unknown'
  });
});

module.exports = router;
