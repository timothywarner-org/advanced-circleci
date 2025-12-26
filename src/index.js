/**
 * Globomantics Robot Fleet Status API
 *
 * A microservice for tracking robot fleet status, maintenance schedules,
 * and operational metrics. Used for CircleCI Advanced Configuration training.
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const robotRoutes = require('./routes/robots');
const healthRoutes = require('./routes/health');
const metricsRoutes = require('./routes/metrics');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(cors());

// Logging
app.use(morgan(ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/robots', robotRoutes);
app.use('/api/metrics', metricsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Globomantics Robot Fleet API',
    version: process.env.npm_package_version || '1.0.0',
    environment: ENV,
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      robots: '/api/robots',
      metrics: '/api/metrics'
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🤖 Globomantics Robot API running on port ${PORT}`);
    console.log(`📊 Environment: ${ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
